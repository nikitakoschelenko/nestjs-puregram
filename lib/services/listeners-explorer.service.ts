import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef, ModulesContainer } from '@nestjs/core';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { ParamMetadata } from '@nestjs/core/helpers/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { HearConditions, HearManager } from '@puregram/hear';
import { SceneManager, StepScene, StepSceneHandler } from '@puregram/scenes';
import { SessionManager } from '@puregram/session';
import { Middleware, NextMiddleware } from 'middleware-io';
import {
  Composer,
  Context,
  MessageContext,
  Telegram,
  UpdateType
} from 'puregram';
import { UpdateName } from 'puregram/types';

import { ListenerHandlerType } from '../enums';
import { TelegramContextType } from '../execution-context';
import { TelegramParamsFactory } from '../factories/telegram-params-factory';
import {
  ContextReplyOptions,
  ListenerMetadata,
  TelegramModuleOptions
} from '../interfaces';
import {
  PARAM_ARGS_METADATA,
  TELEGRAM_HEAR_MANAGER,
  TELEGRAM_MODULE_OPTIONS,
  TELEGRAM_NAME,
  TELEGRAM_SCENE_MANAGER,
  TELEGRAM_SESSION_MANAGER
} from '../telegram.constants';

import { BaseExplorerService } from './base-explorer.service';
import { MetadataAccessorService } from './metadata-accessor.service';

@Injectable()
export class ListenersExplorerService
  extends BaseExplorerService
  implements OnModuleInit
{
  private readonly telegramParamsFactory: TelegramParamsFactory =
    new TelegramParamsFactory();

  private telegram!: Telegram;
  private composer!: Composer<Context>;

  constructor(
    @Inject(TELEGRAM_HEAR_MANAGER)
    private readonly hearManager: HearManager<MessageContext>,
    @Inject(TELEGRAM_SESSION_MANAGER)
    private readonly sessionManager: SessionManager,
    @Inject(TELEGRAM_SCENE_MANAGER)
    private readonly sceneManager: SceneManager,
    @Inject(TELEGRAM_MODULE_OPTIONS)
    private readonly telegramOptions: TelegramModuleOptions,
    @Inject(TELEGRAM_NAME)
    private readonly telegramName: string,

    private readonly moduleRef: ModuleRef,
    private readonly metadataAccessor: MetadataAccessorService,
    private readonly metadataScanner: MetadataScanner,
    private readonly modulesContainer: ModulesContainer,
    private readonly externalContextCreator: ExternalContextCreator
  ) {
    super();
  }

  onModuleInit(): void {
    this.telegram = this.moduleRef.get<Telegram>(this.telegramName, {
      strict: false
    });
    this.composer = Composer.builder();

    if (this.telegramOptions.useComposer) {
      // explore methods and scenes
      this.explore();

      // use custom composer
      this.composer = this.telegramOptions.useComposer(this.composer.clone());
    } else {
      // add `before` middlewares
      this.telegramOptions.middlewaresBefore?.forEach((middleware) =>
        this.composer.use(middleware)
      );

      if (this.telegramOptions.useSessionManager !== false) {
        this.composer.use(this.sessionManager.middleware);
      }

      if (this.telegramOptions.useSceneManager !== false) {
        this.composer.use(this.sceneManager.middleware);
      }

      // explore methods and scenes
      this.explore();

      if (this.telegramOptions.useHearManager !== false) {
        this.composer.use(this.hearManager.middleware);
      }

      if (this.telegramOptions.useSceneManager !== false) {
        this.composer.use(this.sceneManager.middlewareIntercept);
      }

      // add `after` middlewares
      this.telegramOptions.middlewaresAfter?.forEach((middleware) =>
        this.composer.use(middleware)
      );
    }

    // finally
    this.telegram.updates.use(this.composer.compose());
  }

  explore(): void {
    const modules: Module[] = this.getModules(
      this.modulesContainer,
      this.telegramOptions.include ?? []
    );

    this.registerUpdates(modules);
    this.registerScenes(modules);
  }

  private registerUpdates(modules: Module[]): void {
    const updates: InstanceWrapper[] = this.flatMap(
      modules,
      (instance) => this.filterUpdates(instance)!
    );

    updates.forEach((wrapper) => this.registerListeners(wrapper));
  }

  private filterUpdates(
    wrapper: InstanceWrapper
  ): InstanceWrapper<unknown> | undefined {
    const { instance } = wrapper;
    if (!instance) return;

    const isUpdate: boolean = this.metadataAccessor.isUpdate(wrapper.metatype);
    if (!isUpdate) return;

    return wrapper;
  }

  private registerScenes(modules: Module[]): void {
    const scenes: InstanceWrapper[] = this.flatMap(
      modules,
      (wrapper) => this.filterScenes(wrapper)!
    );

    scenes.forEach((wrapper) => this.registerScene(wrapper));
  }

  private filterScenes(
    wrapper: InstanceWrapper
  ): InstanceWrapper<unknown> | undefined {
    const { instance } = wrapper;
    if (!instance) return;

    const isScene: boolean = this.metadataAccessor.isScene(wrapper.metatype);
    if (!isScene) return;

    return wrapper;
  }

  private registerListeners(wrapper: InstanceWrapper<Object>): void {
    const { instance } = wrapper;
    const prototype: Object = Object.getPrototypeOf(instance);

    this.metadataScanner.scanFromPrototype(instance, prototype, (name) =>
      this.registerIfListener(instance, prototype, name)
    );
  }

  private registerScene(wrapper: InstanceWrapper): void {
    const { instance } = wrapper;
    const prototype: Object = Object.getPrototypeOf(instance);

    const slug: string | undefined = this.metadataAccessor.getSceneMetadata(
      wrapper.instance.constructor
    );
    if (!slug) return;

    const steps: [number, string][] = [];

    let currentStep: number = 0;
    let enterHandler: StepSceneHandler | undefined;
    let leaveHandler: StepSceneHandler | undefined;

    this.metadataScanner.scanFromPrototype(instance, prototype, (method) => {
      const target: Function = prototype[method as keyof typeof prototype];

      const action: 'enter' | 'leave' | undefined =
        this.metadataAccessor.getSceneActionMetadata(target);

      switch (action) {
        case 'enter':
          enterHandler = this.createContextCallback(
            instance,
            prototype,
            method
          );
          return;

        case 'leave':
          leaveHandler = this.createContextCallback(
            instance,
            prototype,
            method
          );
          return;

        default:
          break;
      }

      let step: number | boolean | undefined =
        this.metadataAccessor.getSceneStepMetadata(target);

      // step without index
      if (step === true) step = currentStep++;

      if (typeof step === 'number') steps.push([step, method]);
    });

    const scene: StepScene<MessageContext> = new StepScene(slug, {
      enterHandler,
      leaveHandler,
      steps: steps
        .sort(([a], [b]) => a - b)
        .map(([, method]) =>
          this.createContextCallback(instance, prototype, method)
        )
    });

    this.sceneManager.addScenes([scene]);
  }

  private registerIfListener(
    instance: Object,
    prototype: Object,
    method: string
  ): void {
    const target: Function = prototype[method as keyof typeof prototype];

    const metadata: ListenerMetadata[] | undefined =
      this.metadataAccessor.getListenerMetadata(target);
    if (!metadata || metadata.length < 1) return;

    const listenerCallbackFn = this.createContextCallback(
      instance,
      prototype,
      method
    );

    for (const listener of metadata) {
      const { type, args } = listener;

      const handler: Middleware<Context> = async (
        ctx: Context,
        next: NextMiddleware
      ): Promise<void> => {
        const result: unknown = await listenerCallbackFn(ctx, next);

        if (ctx.is(['message'])) {
          if (typeof result === 'string') {
            const replyOptions: ContextReplyOptions | false | undefined =
              this.metadataAccessor.getReplyOptionsMetadata(target) ??
              this.telegramOptions.replyOptions;

            if (replyOptions !== false) {
              if (replyOptions?.send) {
                await (ctx as MessageContext).send(result, replyOptions);
              } else {
                await (ctx as MessageContext).reply(result, replyOptions);
              }
            }
          }
        }

        // TODO-Possible-Feature: Add more supported return types
      };

      switch (type) {
        case ListenerHandlerType.Use:
          this.composer.use(handler);
          break;

        case ListenerHandlerType.On:
          const update: UpdateType | UpdateName | undefined = args[0] as
            | UpdateType
            | UpdateName;
          if (!update) break;

          const middlewares: Middleware<Context>[] =
            (args[1] as Middleware<Context>[]) ?? [];

          this.composer.use((context: Context, next: NextMiddleware) => {
            if (context.is([update])) {
              const handlerComposer: Composer<Context> = new Composer();
              [
                ...(Array.isArray(middlewares) ? middlewares : [middlewares]),
                handler
              ].forEach(handlerComposer.use.bind(handlerComposer));

              const finalHandler: Middleware<Context> =
                handlerComposer.compose();

              return finalHandler(context, next);
            }

            return next();
          });
          break;

        case ListenerHandlerType.Hears:
          const hearConditions: HearConditions<unknown> | undefined =
            args[0] as HearConditions<unknown>;
          if (!hearConditions) break;

          this.hearManager.hear(hearConditions, handler);
          break;

        case ListenerHandlerType.HearFallback:
          this.hearManager.onFallback(handler);
          break;
      }
    }
  }

  createContextCallback(instance: Object, prototype: Object, method: string) {
    const callback: (...args: unknown[]) => unknown = prototype[
      method as keyof typeof prototype
    ] as (...args: unknown[]) => unknown;

    const resolverCallback = this.externalContextCreator.create<
      Record<number, ParamMetadata>,
      TelegramContextType
    >(
      instance,
      callback,
      method,
      PARAM_ARGS_METADATA,
      this.telegramParamsFactory,
      undefined,
      undefined,
      undefined,
      'telegram'
    );

    return resolverCallback;
  }
}

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef, ModulesContainer } from '@nestjs/core';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { ParamMetadata } from '@nestjs/core/helpers/interfaces';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { HearManager } from '@puregram/hear';
import { SceneManager, StepScene } from '@puregram/scenes';
import { SessionManager } from '@puregram/session';
import { NextMiddleware } from 'middleware-io';
import { Composer, Context, MessageContext, Telegram } from 'puregram';
import { AllowArray } from 'puregram/lib/types';
import { Updates } from 'puregram/lib/updates';

import { TelegramContextType } from '../execution-context';
import { TelegramParamsFactory } from '../factories/telegram-params-factory';
import { TelegramModuleOptions } from '../interfaces';
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
  private readonly telegramParamsFactory = new TelegramParamsFactory();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private telegram: Telegram;

  constructor(
    @Inject(TELEGRAM_HEAR_MANAGER)
    private readonly hearManagerProvider: HearManager<MessageContext>,
    @Inject(TELEGRAM_SESSION_MANAGER)
    private readonly sessionManagerProvider: SessionManager,
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

    if (this.telegramOptions.middlewaresBefore) {
      const composer = Composer.builder();
      for (const middleware of this.telegramOptions.middlewaresBefore) {
        composer.use(middleware);
      }
      this.telegram.updates.use(composer.compose());
    }

    if (this.telegramOptions.useSessionManager !== false) {
      this.telegram.updates.use(this.sessionManagerProvider.middleware);
    }

    if (this.telegramOptions.useSceneManager !== false) {
      this.telegram.updates.use(this.sceneManager.middleware);
      this.telegram.updates.use(this.sceneManager.middlewareIntercept);
    }

    this.explore();

    if (this.telegramOptions.useHearManager !== false) {
      this.telegram.updates.use(this.hearManagerProvider.middleware);
    }

    if (this.telegramOptions.middlewaresAfter) {
      const composer = Composer.builder();
      for (const middleware of this.telegramOptions.middlewaresAfter) {
        composer.use(middleware);
      }
      this.telegram.updates.use(composer.compose());
    }
  }

  explore(): void {
    const modules = this.getModules(
      this.modulesContainer,
      this.telegramOptions.include || []
    );

    this.registerUpdates(modules);
    this.registerScenes(modules);
  }

  private registerUpdates(modules: Module[]): void {
    const updates = this.flatMap<InstanceWrapper>(
      modules,
      (instance) => this.filterUpdates(instance)!
    );
    updates.forEach((wrapper) =>
      this.registerListeners(this.telegram.updates, wrapper)
    );
  }

  private filterUpdates(
    wrapper: InstanceWrapper
  ): InstanceWrapper<unknown> | undefined {
    const { instance } = wrapper;
    if (!instance) return;

    const isUpdate = this.metadataAccessor.isUpdate(wrapper.metatype);
    if (!isUpdate) return;

    return wrapper;
  }

  private registerScenes(modules: Module[]): void {
    const scenes = this.flatMap<InstanceWrapper>(
      modules,
      (wrapper) => this.filterScenes(wrapper)!
    );
    scenes.forEach((wrapper) => {
      const sceneId = this.metadataAccessor.getSceneMetadata(
        wrapper.instance.constructor
      );
      if (!sceneId) return;

      this.registerSceneSteps(sceneId, wrapper);
    });
  }

  private filterScenes(
    wrapper: InstanceWrapper
  ): InstanceWrapper<unknown> | undefined {
    const { instance } = wrapper;
    if (!instance) return;

    const isScene = this.metadataAccessor.isScene(wrapper.metatype);
    if (!isScene) return;

    return wrapper;
  }

  private registerListeners(
    updates: Updates,
    wrapper: InstanceWrapper<unknown>
  ): void {
    const { instance } = wrapper;
    const prototype = Object.getPrototypeOf(instance);
    this.metadataScanner.scanFromPrototype(instance, prototype, (name) =>
      this.registerIfListener(updates, instance, prototype, name)
    );
  }

  private registerSceneSteps(
    sceneId: string,
    wrapper: InstanceWrapper<any>
  ): void {
    const { instance } = wrapper;
    const prototype = Object.getPrototypeOf(instance);

    const steps: { step: number; methodName: string }[] = [];

    let enterHandler;
    let leaveHandler;

    let index = 0;
    this.metadataScanner.scanFromPrototype(
      instance,
      prototype,
      (methodName) => {
        const methodRef = prototype[methodName];
        const action = this.metadataAccessor.getSceneActionMetadata(methodRef);
        if (action) {
          if (action === 'enter') {
            enterHandler = this.createContextCallback(
              instance,
              prototype,
              methodName
            );
          } else {
            leaveHandler = this.createContextCallback(
              instance,
              prototype,
              methodName
            );
          }
          return;
        }
        const step = this.metadataAccessor.getSceneStepMetadata(methodRef);
        steps.push({ step: step ?? index++, methodName });
      }
    );

    const scene = new StepScene(sceneId, {
      enterHandler,
      leaveHandler,
      steps: steps
        .sort((a, b) => a.step - b.step)
        .map((e) => {
          const listenerCallbackFn = this.createContextCallback(
            instance,
            prototype,
            e.methodName
          );
          return listenerCallbackFn;
        })
    });
    this.sceneManager.addScenes([scene]);
  }

  private registerIfListener(
    updates: Updates,
    instance: any,
    prototype: any,
    methodName: string
  ): void {
    const methodRef = prototype[methodName];
    const metadata = this.metadataAccessor.getListenerMetadata(methodRef);
    if (!metadata || metadata.length < 1) {
      return undefined;
    }

    const listenerCallbackFn = this.createContextCallback(
      instance,
      prototype,
      methodName
    );

    for (const { handlerType, method, event, args } of metadata) {
      const getHandler =
        () =>
        async (ctx: Context, next: NextMiddleware): Promise<void> => {
          const result = await listenerCallbackFn(ctx, next);
          if (result) {
            switch (true) {
              case ctx.is(['message']): {
                if (typeof result === 'string') {
                  if (this.telegramOptions.notReplyMessage) {
                    await (ctx as MessageContext).send(result);
                  } else {
                    await (ctx as MessageContext).reply(result);
                  }
                }
                break;
              }
            }
          }
          // TODO-Possible-Feature: Add more supported return types
        };

      switch (handlerType) {
        case 'telegram_updates': {
          if (method === 'use') {
            updates.use(getHandler());
          } else if (method) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            updates[method](event, [...args, getHandler()] as AllowArray<any>);
          }
          break;
        }
        case 'hears': {
          if (method === 'onFallback') {
            this.hearManagerProvider.onFallback(getHandler());
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.hearManagerProvider.hear(event, ...[...args, getHandler()]);
          }
          break;
        }
        // TODO: remake it (support hearManager, etc)
      }
    }
  }

  createContextCallback<T extends Record<string, unknown>>(
    instance: T,
    prototype: unknown,
    methodName: string
  ) {
    const paramsFactory = this.telegramParamsFactory;
    const resolverCallback = this.externalContextCreator.create<
      Record<number, ParamMetadata>,
      TelegramContextType
    >(
      instance,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      prototype[methodName],
      methodName,
      PARAM_ARGS_METADATA,
      paramsFactory,
      undefined,
      undefined,
      undefined,
      'telegram'
    );
    return resolverCallback;
  }
}

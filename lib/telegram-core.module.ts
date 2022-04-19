import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
  Type
} from '@nestjs/common';
import { DiscoveryModule, ModuleRef } from '@nestjs/core';
import { Telegram } from 'puregram';

import {
  TelegramModuleAsyncOptions,
  TelegramModuleOptions,
  TelegramOptionsFactory
} from './interfaces';
import {
  hearManagerProvider,
  sceneManagerProvider,
  sessionManagerProvider
} from './providers';
import { ListenersExplorerService, MetadataAccessorService } from './services';
import { TELEGRAM_MODULE_OPTIONS, TELEGRAM_NAME } from './telegram.constants';
import { createTelegramApiFactory, getTelegramToken } from './utils';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [ListenersExplorerService, MetadataAccessorService]
})
export class TelegramCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(TELEGRAM_NAME)
    private readonly telegramName: string,
    private readonly moduleRef: ModuleRef
  ) {}

  public static forRoot(options: TelegramModuleOptions): DynamicModule {
    const telegramApiName: string = getTelegramToken(options.telegramName);

    const telegramApiNameProvider: Provider = {
      provide: TELEGRAM_NAME,
      useValue: telegramApiName
    };

    const telegramApiProvider: Provider = {
      provide: telegramApiName,
      useFactory: () => createTelegramApiFactory(options)
    };

    const providers: Provider[] = [
      sessionManagerProvider,
      sceneManagerProvider,
      hearManagerProvider,
      telegramApiNameProvider,
      telegramApiProvider
    ];

    return {
      module: TelegramCoreModule,
      providers: [
        {
          provide: TELEGRAM_MODULE_OPTIONS,
          useValue: options
        },
        ...providers
      ],
      exports: [...providers]
    };
  }

  public static forRootAsync(
    options: TelegramModuleAsyncOptions
  ): DynamicModule {
    const telegramApiName: string = getTelegramToken(options.telegramName);

    const telegramApiNameProvider: Provider = {
      provide: TELEGRAM_NAME,
      useValue: telegramApiName
    };

    const telegramApiProvider: Provider = {
      provide: telegramApiName,
      useFactory: (options: TelegramModuleOptions) =>
        createTelegramApiFactory(options),
      inject: [TELEGRAM_MODULE_OPTIONS]
    };

    const asyncProviders: Provider[] = this.createAsyncProviders(options);

    const providers: Provider[] = [
      sessionManagerProvider,
      sceneManagerProvider,
      hearManagerProvider,
      telegramApiNameProvider,
      telegramApiProvider
    ];

    return {
      module: TelegramCoreModule,
      imports: options.imports,
      providers: [...asyncProviders, ...providers],
      exports: [...providers]
    };
  }

  private static createAsyncProviders(
    options: TelegramModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass: Type<TelegramOptionsFactory> = options.useClass!;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass
      }
    ];
  }

  private static createAsyncOptionsProvider(
    options: TelegramModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: TELEGRAM_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }

    const inject: Type<TelegramOptionsFactory>[] = [
      (options.useClass || options.useExisting)!
    ];

    return {
      provide: TELEGRAM_MODULE_OPTIONS,
      useFactory: (optionsFactory: TelegramOptionsFactory) =>
        optionsFactory.createTelegramOptions(),
      inject
    };
  }

  onApplicationShutdown(): void {
    const telegram: Telegram = this.moduleRef.get<Telegram>(this.telegramName);
    if (telegram) return telegram.updates.stopPolling();
  }
}

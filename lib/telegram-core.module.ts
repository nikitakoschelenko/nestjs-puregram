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
    const telegramApiName = getTelegramToken(options.telegramName);

    const telegramApiNameProvider = {
      provide: TELEGRAM_NAME,
      useValue: telegramApiName
    };

    const telegramApiProvider: Provider = {
      provide: telegramApiName,
      useFactory: async () => await createTelegramApiFactory(options)
    };

    const providers = [
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
    const telegramApiName = getTelegramToken(options.telegramName);

    const telegramApiNameProvider = {
      provide: TELEGRAM_NAME,
      useValue: telegramApiName
    };

    const telegramApiProvider: Provider = {
      provide: telegramApiName,
      useFactory: async (options: TelegramModuleOptions) =>
        await createTelegramApiFactory(options),
      inject: [TELEGRAM_MODULE_OPTIONS]
    };

    const asyncProviders = this.createAsyncProviders(options);

    const providers = [
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

  async onApplicationShutdown(): Promise<void> {
    const telegram = this.moduleRef.get<Telegram>(this.telegramName);
    telegram && telegram.updates.stopPolling();
  }

  private static createAsyncProviders(
    options: TelegramModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<TelegramOptionsFactory>;
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

    // `as Type<TelegramOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<TelegramOptionsFactory>
    ];
    return {
      provide: TELEGRAM_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TelegramOptionsFactory) =>
        await optionsFactory.createTelegramOptions(),
      inject
    };
  }
}

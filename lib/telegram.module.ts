import { DynamicModule, Module } from '@nestjs/common';

import {
  TelegramModuleAsyncOptions,
  TelegramModuleOptions
} from './interfaces';
import { TelegramCoreModule } from './telegram-core.module';

@Module({})
export class TelegramModule {
  public static forRoot(options: TelegramModuleOptions): DynamicModule {
    return {
      module: TelegramModule,
      imports: [TelegramCoreModule.forRoot(options)],
      exports: [TelegramCoreModule]
    };
  }

  public static forRootAsync(
    options: TelegramModuleAsyncOptions
  ): DynamicModule {
    return {
      module: TelegramModule,
      imports: [TelegramCoreModule.forRootAsync(options)],
      exports: [TelegramCoreModule]
    };
  }
}

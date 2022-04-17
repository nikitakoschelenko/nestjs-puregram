import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { HearManager } from '@puregram/hear';
import { SceneManager } from '@puregram/scenes';
import { SessionManager } from '@puregram/session';
import { Middleware } from 'middleware-io';
import { MessageContext } from 'puregram';
import { StartPollingOptions, TelegramOptions } from 'puregram/lib/interfaces';

export interface TelegramModuleOptions {
  token: string;
  telegramName?: string;
  options?: Partial<TelegramOptions>;
  pollingOptions?: Omit<StartPollingOptions, 'token'> | false;
  include?: Function[];
  middlewaresBefore?: ReadonlyArray<Middleware<any>>;
  middlewaresAfter?: ReadonlyArray<Middleware<any>>;
  useSessionManager?: boolean | SessionManager;
  useSceneManager?: boolean | SceneManager;
  useHearManager?: boolean | HearManager<MessageContext>;
  notReplyMessage?: boolean;
}

export interface TelegramOptionsFactory {
  createTelegramOptions():
    | Promise<TelegramModuleOptions>
    | TelegramModuleOptions;
}

export interface TelegramModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  telegramName?: string;
  useExisting?: Type<TelegramOptionsFactory>;
  useClass?: Type<TelegramOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<TelegramModuleOptions> | TelegramModuleOptions;
  inject?: any[];
}

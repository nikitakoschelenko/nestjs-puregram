import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { HearManager } from '@puregram/hear';
import { SceneManager } from '@puregram/scenes';
import { SessionManager } from '@puregram/session';
import { Middleware } from 'middleware-io';
import { MessageContext } from 'puregram';
import { StartPollingOptions, TelegramOptions } from 'puregram/interfaces';

import { TelegramInternalMiddleware } from '../enums/telegram-internal-middleware.enum';

import { ContextReplyOptions } from './context-reply-options.interface';

export interface TelegramModuleOptions {
  /**
   * Bot's token
   */
  token: string;

  /**
   * `Telegram` instance name
   */
  name?: string;

  /**
   * `Telegram` constructor options
   */
  options?: Partial<Omit<TelegramOptions, 'token'>>;

  /**
   * `startPolling` method options
   */
  pollingOptions?: StartPollingOptions | false;

  /**
   * Reply options for method returns
   */
  replyOptions?: ContextReplyOptions | false;

  /**
   * Whitelist of modules to include
   */
  include?: Function[];

  /**
   * Order global and internal middlewares
   */
  middlewares?: ReadonlyArray<Middleware<any> | TelegramInternalMiddleware>;

  /**
   * Use global middlewares before others
   * @deprecated Use the `middlewares` option to order global and internal middlewares
   */
  middlewaresBefore?: ReadonlyArray<Middleware<any>>;

  /**
   * Use global middlewares after others
   * @deprecated Use the `middlewares` option to order global and internal middlewares
   */
  middlewaresAfter?: ReadonlyArray<Middleware<any>>;

  /**
   * Use custom `SessionManager` or turn it off
   */
  useSessionManager?: boolean | SessionManager;

  /**
   * Use custom `SceneManager` or turn it off
   */
  useSceneManager?: boolean | SceneManager;

  /**
   * Use custom `HearManager` or turn it off
   */
  useHearManager?: boolean | HearManager<MessageContext>;
}

export interface TelegramOptionsFactory {
  createTelegramOptions():
    | Promise<TelegramModuleOptions>
    | TelegramModuleOptions;
}

export interface TelegramModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * `Telegram` instance name
   */
  name?: string;

  useExisting?: Type<TelegramOptionsFactory>;
  useClass?: Type<TelegramOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<TelegramModuleOptions> | TelegramModuleOptions;
  inject?: any[];
}

import { Provider } from '@nestjs/common';
import { SessionManager } from '@puregram/session';

import { TelegramModuleOptions } from '../interfaces';
import {
  TELEGRAM_MODULE_OPTIONS,
  TELEGRAM_SESSION_MANAGER
} from '../telegram.constants';

export const sessionManagerProvider: Provider = {
  provide: TELEGRAM_SESSION_MANAGER,
  useFactory: (telegramOptions: TelegramModuleOptions) =>
    telegramOptions.useSessionManager instanceof SessionManager
      ? telegramOptions.useSessionManager
      : new SessionManager(),
  inject: [TELEGRAM_MODULE_OPTIONS]
};

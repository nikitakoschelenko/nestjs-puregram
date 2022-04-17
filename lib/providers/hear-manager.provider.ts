import { Provider } from '@nestjs/common';
import { HearManager } from '@puregram/hear';

import { TelegramModuleOptions } from '../interfaces';
import {
  TELEGRAM_HEAR_MANAGER,
  TELEGRAM_MODULE_OPTIONS
} from '../telegram.constants';

export const hearManagerProvider: Provider = {
  provide: TELEGRAM_HEAR_MANAGER,
  useFactory: (telegramOptions: TelegramModuleOptions) =>
    telegramOptions.useHearManager instanceof HearManager
      ? telegramOptions.useHearManager
      : new HearManager(),
  inject: [TELEGRAM_MODULE_OPTIONS]
};

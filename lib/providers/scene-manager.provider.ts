import { Provider } from '@nestjs/common';
import { SceneManager } from '@puregram/scenes';

import { TelegramModuleOptions } from '../interfaces';
import {
  TELEGRAM_MODULE_OPTIONS,
  TELEGRAM_SCENE_MANAGER
} from '../telegram.constants';

export const sceneManagerProvider: Provider = {
  provide: TELEGRAM_SCENE_MANAGER,
  useFactory: (telegramOptions: TelegramModuleOptions) =>
    telegramOptions.useSceneManager instanceof SceneManager
      ? telegramOptions.useSceneManager
      : new SceneManager(),
  inject: [TELEGRAM_MODULE_OPTIONS]
};

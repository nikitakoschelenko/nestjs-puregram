import { SetMetadata } from '@nestjs/common';

import { TELEGRAM_SCENE_ACTION_METADATA } from '../../telegram.constants';

export const SceneLeave = () =>
  SetMetadata(TELEGRAM_SCENE_ACTION_METADATA, 'leave');

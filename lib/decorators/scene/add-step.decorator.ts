import { SetMetadata } from '@nestjs/common';

import { TELEGRAM_SCENE_STEP_METADATA } from '../../telegram.constants';

export const AddStep = (step?: number) =>
  SetMetadata<string>(TELEGRAM_SCENE_STEP_METADATA, step);

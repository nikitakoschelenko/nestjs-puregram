import { SetMetadata } from '@nestjs/common';

import { TELEGRAM_SCENE_METADATA } from '../../telegram.constants';

/**
 * TODO
 */
export const Scene = (id: string): ClassDecorator =>
  SetMetadata(TELEGRAM_SCENE_METADATA, id);

import { SetMetadata } from '@nestjs/common';

import { TELEGRAM_SCENE_METADATA } from '../../telegram.constants';

/**
 * Describes this class as a scene.
 * Now you can add a steps by using `@AddStep` decorator.
 */
export const Scene = (slug: string): ClassDecorator =>
  SetMetadata(TELEGRAM_SCENE_METADATA, slug);

import { SetMetadata } from '@nestjs/common';

import { TELEGRAM_UPDATE_METADATA } from '../../telegram.constants';

/**
 * `@Update()` decorator, it's like NestJS `@Controller()` decorator,
 * but for Telegram Bot API updates.
 */
export const Update = (): ClassDecorator =>
  SetMetadata(TELEGRAM_UPDATE_METADATA, true);

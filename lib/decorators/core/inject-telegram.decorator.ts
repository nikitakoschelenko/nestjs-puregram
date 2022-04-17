import { Inject } from '@nestjs/common';

import { getTelegramToken } from '../../utils';

export const InjectTelegram = (telegramName?: string): ParameterDecorator =>
  Inject(getTelegramToken(telegramName));

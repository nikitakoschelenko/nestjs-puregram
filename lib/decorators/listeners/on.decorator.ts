import { Middleware } from 'middleware-io';
import { Context, UpdateType } from 'puregram';
import { UpdateName } from 'puregram/lib/types';

import { createListenerDecorator } from '../../utils';

export const On = createListenerDecorator<
  UpdateType | UpdateName,
  Middleware<Context>
>('telegram_updates', 'on');

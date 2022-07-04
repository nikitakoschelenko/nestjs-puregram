import { Middleware } from 'middleware-io';
import { Context, UpdateType } from 'puregram';
import { MaybeArray, UpdateName } from 'puregram/types';

import { ListenerHandlerType } from '../../enums/listener-handler-type.enum';
import { createListenerDecorator } from '../../utils';

export const On = <T = {}>(
  update: UpdateType | UpdateName,
  middlewares?: MaybeArray<Middleware<Context & T>>
) => createListenerDecorator(ListenerHandlerType.ON, update, middlewares);

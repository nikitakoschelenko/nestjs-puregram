import { Middleware } from 'middleware-io';
import { Context, UpdateType } from 'puregram';
import { AllowArray, UpdateName } from 'puregram/types';

import { ListenerHandlerType } from '../../enums/listener-handler-type.enum';
import { createListenerDecorator } from '../../utils';

export const On = <T = {}>(
  update: UpdateType | UpdateName,
  middlewares?: AllowArray<Middleware<Context & T>>
) => createListenerDecorator(ListenerHandlerType.ON, update, middlewares);

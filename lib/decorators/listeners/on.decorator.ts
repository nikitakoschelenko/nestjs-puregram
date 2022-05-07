import { Middleware } from 'middleware-io';
import { Context, UpdateType } from 'puregram';
import { AllowArray, UpdateName } from 'puregram/types';

import { ListenerHandlerType } from '../../enums/listener-handler-type.enum';
import { createListenerDecorator } from '../../utils';

export const On = (
  update: UpdateType | UpdateName,
  middlewares?: AllowArray<Middleware<Context>>
) => createListenerDecorator(ListenerHandlerType.ON, update, middlewares);

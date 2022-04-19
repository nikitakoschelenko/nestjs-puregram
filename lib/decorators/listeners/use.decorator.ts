import { ListenerHandlerType } from '../../enums/listener-handler-type.enum';
import { createListenerDecorator } from '../../utils';

export const Use = () => createListenerDecorator(ListenerHandlerType.USE);

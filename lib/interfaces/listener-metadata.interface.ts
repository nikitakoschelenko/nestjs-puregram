import { ListenerHandlerType } from '../enums/listener-handler-type.enum';

export interface ListenerMetadata {
  type: ListenerHandlerType;
  args: unknown[];
}

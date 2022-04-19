import { ListenerHandlerType } from '../enums/listener-handler-type.enum';
import { ListenerMetadata } from '../interfaces';
import { TELEGRAM_LISTENERS_METADATA } from '../telegram.constants';

export function createListenerDecorator(
  type: ListenerHandlerType,
  ...args: unknown[]
): MethodDecorator {
  return (
    target: Object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    const metadata: ListenerMetadata[] = [
      {
        type,
        args
      }
    ];

    const previousValue: ListenerMetadata[] =
      Reflect.getMetadata(TELEGRAM_LISTENERS_METADATA, descriptor?.value) || [];
    const value: ListenerMetadata[] = [...previousValue, ...metadata];

    Reflect.defineMetadata(
      TELEGRAM_LISTENERS_METADATA,
      value,
      descriptor?.value
    );
  };
}

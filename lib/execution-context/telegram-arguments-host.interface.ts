import { ArgumentsHost } from '@nestjs/common';

export interface ITelegramArgumentsHost extends ArgumentsHost {
  getContext<T = unknown>(): T;
  getNext<T = unknown>(): T;
}

import { ArgumentsHost } from '@nestjs/common';

export interface ITelegramArgumentsHost extends ArgumentsHost {
  getContext<T = any>(): T;
  getNext<T = any>(): T;
}

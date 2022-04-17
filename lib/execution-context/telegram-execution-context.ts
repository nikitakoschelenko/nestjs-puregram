import { ContextType, ExecutionContext } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

import { ITelegramArgumentsHost } from './telegram-arguments-host.interface';

export type TelegramContextType = 'telegram' | ContextType;

export class TelegramExecutionContext
  extends ExecutionContextHost
  implements ITelegramArgumentsHost
{
  static create(context: ExecutionContext): TelegramExecutionContext {
    const type = context.getType();
    const telegramContext = new TelegramExecutionContext(
      context.getArgs(),
      context.getClass(),
      context.getHandler()
    );
    telegramContext.setType(type);
    return telegramContext;
  }

  getType<TContext extends string = TelegramContextType>(): TContext {
    return super.getType();
  }

  getContext<T = any>(): T {
    return this.getArgByIndex(0);
  }

  getNext<T = any>(): T {
    return this.getArgByIndex(1);
  }
}

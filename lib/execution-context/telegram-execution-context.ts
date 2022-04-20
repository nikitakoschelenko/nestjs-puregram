import { ContextType, ExecutionContext } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

import { ITelegramArgumentsHost } from './telegram-arguments-host.interface';

export type TelegramContextType = 'telegram' | ContextType;

export class TelegramExecutionContext
  extends ExecutionContextHost
  implements ITelegramArgumentsHost
{
  static create(context: ExecutionContext): TelegramExecutionContext {
    const type: ContextType = context.getType();

    const telegramContext: TelegramExecutionContext =
      new TelegramExecutionContext(
        context.getArgs(),
        context.getClass(),
        context.getHandler()
      );
    telegramContext.setType(type);

    return telegramContext;
  }

  getType<T extends string = TelegramContextType>(): T {
    return super.getType();
  }

  getContext<T = unknown>(): T {
    return this.getArgByIndex(0);
  }

  getNext<T = unknown>(): T {
    return this.getArgByIndex(1);
  }
}

import { ArgumentsHost } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

import { ITelegramArgumentsHost } from './telegram-arguments-host.interface';

export class TelegramArgumentsHost
  extends ExecutionContextHost
  implements ITelegramArgumentsHost
{
  static create(context: ArgumentsHost): ITelegramArgumentsHost {
    const type = context.getType();
    const telegramContext = new TelegramArgumentsHost(context.getArgs());
    telegramContext.setType(type);
    return telegramContext;
  }

  getContext<T = any>(): T {
    return this.getArgByIndex(0);
  }

  getNext<T = any>(): T {
    return this.getArgByIndex(1);
  }
}

import { ArgumentsHost, ContextType } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

import { ITelegramArgumentsHost } from './telegram-arguments-host.interface';

export class TelegramArgumentsHost
  extends ExecutionContextHost
  implements ITelegramArgumentsHost
{
  static create(host: ArgumentsHost): ITelegramArgumentsHost {
    const type: ContextType = host.getType();

    const telegramContext: TelegramArgumentsHost = new TelegramArgumentsHost(
      host.getArgs()
    );
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

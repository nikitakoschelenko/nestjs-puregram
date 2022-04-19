import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Context as TelegramContext } from 'puregram';

import { TelegramExecutionContext } from '../../execution-context';

export const Context = createParamDecorator(
  (data: keyof TelegramContext | never, context: ExecutionContext) => {
    const executionContext: TelegramExecutionContext =
      TelegramExecutionContext.create(context);

    const telegramContext: TelegramContext = executionContext.getContext();

    return data ? telegramContext[data] : telegramContext;
  }
);

// alias
export const Ctx = Context;

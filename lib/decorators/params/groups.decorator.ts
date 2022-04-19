import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import {} from '@puregram/hear';
import { Context, MessageContext } from 'puregram';

import { TelegramExecutionContext } from '../../execution-context';

export const Groups = createParamDecorator(
  (
    data: number,
    context: ExecutionContext
  ): Record<string, string> | undefined => {
    const executionContext: TelegramExecutionContext =
      TelegramExecutionContext.create(context);

    const telegramContext: Context = executionContext.getContext();
    if (!telegramContext.is(['message'])) return {};

    const matches: RegExpMatchArray | null = (
      telegramContext as MessageContext & { $match: RegExpMatchArray | null }
    ).$match;

    return matches?.groups;
  }
);

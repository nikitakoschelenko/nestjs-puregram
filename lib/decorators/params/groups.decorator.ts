import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ContextMatch } from '@puregram/hear';
import { Context, MessageContext } from 'puregram';

import { TelegramExecutionContext } from '../../execution-context';

export const Groups = createParamDecorator(
  (
    data: string,
    context: ExecutionContext
  ): Record<string, string> | string | undefined => {
    const executionContext: TelegramExecutionContext =
      TelegramExecutionContext.create(context);

    const telegramContext: Context = executionContext.getContext();
    if (!telegramContext.is(['message'])) return {};

    const matches: RegExpMatchArray | null = (
      telegramContext as MessageContext & ContextMatch
    ).$match;
    const groups: Record<string, string> = matches?.groups ?? {};

    return data ? groups[data] : groups;
  }
);

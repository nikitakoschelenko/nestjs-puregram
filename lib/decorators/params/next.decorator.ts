import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { NextMiddleware } from 'middleware-io';

import { TelegramExecutionContext } from '../../execution-context';

export const Next = createParamDecorator(
  (data: never, context: ExecutionContext): NextMiddleware => {
    const executionContext: TelegramExecutionContext =
      TelegramExecutionContext.create(context);

    const next: NextMiddleware = executionContext.getNext();

    return next;
  }
);

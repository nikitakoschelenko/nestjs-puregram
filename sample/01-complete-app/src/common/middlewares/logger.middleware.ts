import { Injectable, Logger } from '@nestjs/common';
import { NextMiddleware } from 'middleware-io';
import { Context } from 'puregram';

@Injectable()
export class LoggerMiddleware {
  static get middleware() {
    const logger: Logger = new Logger(LoggerMiddleware.name);

    return (ctx: Context, next: NextMiddleware): unknown => {
      if (ctx.is(['message'])) {
        logger.debug(`New update received: ${ctx.updateId}`);
      }

      return next();
    };
  }
}

import { Logger } from '@nestjs/common';
import { Update, On, Ctx, Hears, Next, InjectTelegram } from 'nestjs-puregram';
import { NextMiddleware, NextMiddlewareReturn } from 'middleware-io';
import { MessageContext, Telegram } from 'puregram';

@Update()
export class BotUpdate {
  private logger: Logger = new Logger(BotUpdate.name);

  constructor(@InjectTelegram() private telegram: Telegram) {}

  onModuleInit(): void {
    this.logger.log(`@${this.telegram.bot.username} started polling updates`);
  }

  @On('message')
  onMessage(
    @Ctx() ctx: MessageContext,
    @Next() next: NextMiddleware
  ): NextMiddlewareReturn {
    this.logger.debug(`New message received: ${ctx.text}`);

    return next();
  }

  @Hears(/^ping$/i)
  ping(): string {
    return 'Pong!';
  }
}

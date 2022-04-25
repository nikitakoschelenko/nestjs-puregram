import { ParseIntPipe, UseFilters, UseGuards } from '@nestjs/common';
import {
  Update,
  On,
  Ctx,
  Hears,
  Groups,
  ReplyOptions,
  HearFallback
} from 'nestjs-puregram';
import { NextMiddleware } from 'middleware-io';
import {
  CallbackQueryContext,
  InlineKeyboardBuilder,
  Markdown,
  MessageContext
} from 'puregram';
import { StepContext } from '@puregram/scenes';

import { TelegramExceptionFilter } from '@/common/filters/telegram-exception.filter';
import { PrivateGuard } from '@/common/guards/private.guard';
import { SIGNUP_SCENE } from './echo.constants';

@Update()
@UseFilters(TelegramExceptionFilter)
@UseGuards(PrivateGuard)
export class EchoUpdate {
  // hear fallback
  @HearFallback()
  fallback(): string {
    return 'What?';
  }

  // simple command
  @Hears('/ping')
  ping(): string {
    return 'Pong!';
  }

  // with regex groups, pipes and markdown
  @Hears(/^\/parseInt (?<int>\d+)$/i)
  @ReplyOptions({ parse_mode: 'markdown' })
  parseInt(@Groups('int', new ParseIntPipe()) int: number): string {
    return `Your integer: ${Markdown.code(String(int))}`;
  }

  // scene
  @Hears('/signup')
  signup(@Ctx() context: MessageContext & StepContext): Promise<unknown> {
    return context.scene.enter(SIGNUP_SCENE);
  }

  // callback button
  @Hears('/callback')
  callback(@Ctx() context: MessageContext): Promise<unknown> {
    return context.reply('Call me back, okey?', {
      reply_markup: new InlineKeyboardBuilder().textButton({
        text: 'Send callback query',
        payload: {
          type: 'random-query',
          random: Math.random().toString()
        }
      })
    });
  }

  // receive callback query (from callback button)
  @On(
    'callback_query',
    (context: CallbackQueryContext, next: NextMiddleware) =>
      context.queryPayload.type === 'random-query' && next()
  )
  callbackQuery(@Ctx() context: CallbackQueryContext): Promise<unknown> {
    return context.answerCallbackQuery({
      text: `${context.queryPayload.random} is your random number!`,
      show_alert: true
    });
  }
}

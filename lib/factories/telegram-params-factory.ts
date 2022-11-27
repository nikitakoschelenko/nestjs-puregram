import { ParamData } from '@nestjs/common';
import { ParamsFactory } from '@nestjs/core/helpers/external-context-creator';
import { NextMiddleware } from 'middleware-io';
import { Context } from 'puregram';

import { TelegramParamtype } from '../enums/telegram-paramtype.enum';

export class TelegramParamsFactory implements ParamsFactory {
  exchangeKeyForValue(
    type: TelegramParamtype,
    data: ParamData,
    args: unknown[]
  ): unknown {
    const [ctx, next] = args as [Context, NextMiddleware];

    switch (type) {
      case TelegramParamtype.Next:
        return next;
      case TelegramParamtype.Context:
        return data && ctx ? ctx[data as keyof Context] : ctx;
      default:
        return null;
    }
  }
}

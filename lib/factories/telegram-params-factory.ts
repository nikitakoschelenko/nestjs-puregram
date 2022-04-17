import { ParamData } from '@nestjs/common';
import { ParamsFactory } from '@nestjs/core/helpers/external-context-creator';
import { Context } from 'puregram';

import { TelegramParamtype } from '../enums/telegram-paramtype.enum';

export class TelegramParamsFactory implements ParamsFactory {
  exchangeKeyForValue(
    type: TelegramParamtype,
    data: ParamData,
    args: unknown[]
  ): unknown {
    const [ctx, next] = args as [Context, Function];

    switch (type) {
      case TelegramParamtype.NEXT:
        return next;
      case TelegramParamtype.CONTEXT:
        return data && ctx ? ctx[data as keyof Context] : ctx;
      default:
        return null;
    }
  }
}

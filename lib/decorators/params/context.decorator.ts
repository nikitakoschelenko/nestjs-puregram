import { PipeTransform, Type } from '@nestjs/common';

import { TelegramParamtype } from '../../enums/telegram-paramtype.enum';
import { createTelegramPipesParamDecorator } from '../../utils/param-decorator.util';

export function Context(): ParameterDecorator;
export function Context(
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function Context(
  property: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function Context(
  property?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
) {
  return createTelegramPipesParamDecorator(TelegramParamtype.CONTEXT)(
    property,
    ...pipes
  );
}

export const Ctx = Context;

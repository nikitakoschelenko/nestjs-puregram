import { PipeTransform, Type, assignMetadata } from '@nestjs/common';
import { isNil, isString } from '@nestjs/common/utils/shared.utils';

import { TelegramParamtype } from '../enums/telegram-paramtype.enum';
import { PARAM_ARGS_METADATA } from '../telegram.constants';

export type ParamData = object | string | number;

export const createTelegramParamDecorator = (paramtype: TelegramParamtype) => {
  return (data?: ParamData): ParameterDecorator =>
    (target, key, index) => {
      const args =
        Reflect.getMetadata(PARAM_ARGS_METADATA, target.constructor, key) || {};
      Reflect.defineMetadata(
        PARAM_ARGS_METADATA,
        assignMetadata(args, paramtype, index, data),
        target.constructor,
        key
      );
    };
};

export const createTelegramPipesParamDecorator =
  (paramtype: TelegramParamtype) =>
  (
    data?: any,
    ...pipes: (Type<PipeTransform> | PipeTransform)[]
  ): ParameterDecorator =>
  (target, key, index) => {
    addPipesMetadata(paramtype, data, pipes, target, key, index);
  };

export const addPipesMetadata = (
  paramtype: TelegramParamtype,
  data: any,
  pipes: (Type<PipeTransform> | PipeTransform)[],
  target: Record<string, any>,
  key: string | symbol,
  index: number
) => {
  const args =
    Reflect.getMetadata(PARAM_ARGS_METADATA, target.constructor, key) || {};
  const hasParamData = isNil(data) || isString(data);
  const paramData = hasParamData ? data : undefined;
  const paramPipes = hasParamData ? pipes : [data, ...pipes];

  Reflect.defineMetadata(
    PARAM_ARGS_METADATA,
    assignMetadata(
      args,
      paramtype,
      index,
      paramData as ParamData | undefined,
      ...paramPipes
    ),
    target.constructor,
    key
  );
};

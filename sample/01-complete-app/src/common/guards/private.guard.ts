import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TelegramException, TelegramExecutionContext } from 'nestjs-puregram';
import { Context, MessageContext } from 'puregram';

@Injectable()
export class PrivateGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(executionContext: ExecutionContext): Promise<boolean> {
    const context: Context =
      TelegramExecutionContext.create(executionContext).getContext();

    if (context.is(['message'])) {
      if (!(context as MessageContext).isPM)
        throw new TelegramException('This bot is available only in PM.');
    }

    return true;
  }
}

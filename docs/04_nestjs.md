# NestJS's [Exception Filters](https://docs.nestjs.com/exception-filters), [Pipes](https://docs.nestjs.com/pipes), [Guards](https://docs.nestjs.com/guards), [Interceptors](https://docs.nestjs.com/interceptors)
This module supports Exception Filters, Pipes, Guards and Interceptors.

## Exception filter example
```typescript
import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { TelegramException, TelegramArgumentsHost } from 'nestjs-puregram';
import { Context, MessageContext } from 'puregram';

@Catch(TelegramException)
export class TelegramExceptionFilter implements ExceptionFilter {
  catch(exception: TelegramException, host: ArgumentsHost) {
    const context: Context = TelegramArgumentsHost.create(host).getContext();

    if (context.is(['message'])) {
      return (context as MessageContext).reply(exception.message);
    }
  }
}
```

## Pipe example
```typescript
import { ParseIntPipe } from '@nestjs/common';
import { Update, Hears, Ctx, Groups } from 'nestjs-puregram';
import { MessageContext } from 'puregram';

import { ReverseStringPipe } from './reverse-string.pipe';

@Update()
export class BotUpdate {
  @Hears(/^\/int (?<int>\d+)$/i)
  int(
    @Ctx() context: MessageContext,
    @Groups('int', new ParseIntPipe()) int: number
  ): Promise<unknown> {
    return context.reply(`Your int: \`${int}\``, {
      parse_mode: 'markdown'
    });
  }

  @Hears(/^\/reverse (?<text>.*)$/i)
  reverse(@Groups('text', new ReverseStringPipe()) reversed: string): string {
    return reversed;
  }
}
```

```typescript
import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ReverseStringPipe implements PipeTransform {
  transform(value: string): string {
    return value.split('').reverse().join('');
  }
}
```

## Guard example
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TelegramExecutionContext, TelegramException } from 'nestjs-puregram';
import { Context } from 'puregram';

@Injectable()
export class AdminGuard implements CanActivate {
  // IMPORTANT: canActivate function MUST be async
  async canActivate(executionContext: ExecutionContext): Promise<boolean> {
    const context: Context =
      TelegramExecutionContext.create(executionContext).getContext();

    const admin: boolean = this.adminIds.includes(context.senderId);
    if (!admin) throw new TelegramException('Forbidden resource');

    return true;
  }
}
```

```typescript
import { UseFilters, UseGuards } from '@nestjs/common';
import { Update, Hears } from 'nestjs-puregram';

import { TelegramExceptionFilter } from './telegram-exception.filter'
import { AdminGuard } from './admin.guard'

@Update()
@UseFilters(TelegramExceptionFilter)
export class BotUpdate {
  @Hears(/^\/ping$/i)
  @UseGuards(AdminGuard)
  ping(): string {
    return 'Pong!';
  }
}
```

## Interceptor example
```typescript
import { Injectable, NestInterceptor, Logger, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger: Logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logger.debug('Before...');

    const now: number = Date.now();
    return next
      .handle()
      .pipe(tap(() => this.logger.debug(`After... ${Date.now() - now}ms`)));
  }
}
```

```typescript
import { UseInterceptors } from '@nestjs/common';
import { Update, Use, Ctx, Next } from 'nestjs-puregram';
import { TelegramContext } from 'puregram';
import { NextMiddleware, NextMiddlewareReturn } from 'middleware-io';

@Update()
export class BotUpdate {
  @Use()
  @UseInterceptors(LoggingInterceptor)
  middleware(
    @Ctx() ctx: TelegramContext,
    @Next() next: NextMiddleware
  ): NextMiddlewareReturn {
    this.logger.debug(`New update received: ${ctx.updateId}`);

    return next();
  }
}
```

<h3 dir="rtl">
  <a href="/docs/05_more.md">→ Next</a>
</h3>

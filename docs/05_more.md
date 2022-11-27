# Injection
When you need access to a Telegram instance, you can inject it:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectTelegram } from 'nestjs-puregram';
import { Telegram } from 'puregram';

@Injectable()
export class BotService {
  constructor(
    @InjectTelegram() private telegram: Telegram
  ) {}

  // do what the fck you want
}
```

# Middlewares
You can use middlewares for `puregram` and customize its order:
```typescript
import { Module } from '@nestjs/common';
import { TelegramModule, TelegramInternalMiddleware } from 'nestjs-puregram';

@Module({
  imports: [
    TelegramModule.forRoot({
      token: 'mytoken',
      middlewares: [
        // use sessionManager.middleware
        TelegramInternalMiddleware.SessionManager,
        // use own middleware
        (context: SessionInterface, next) => {
          // log current session
          console.log(context.session)
          return next()
        },
        // use sceneManager.middleware and sceneManager.middlewareIntercept
        TelegramInternalMiddleware.SceneManager,
        // use hearManager.middleware (methods that are decorated with the `@Hears(...)` decorator will be called)
        TelegramInternalMiddleware.HearManager,
        // use your middlewares (methods that are decorated with the `@On(...)` and `@Use()` decorators will be called)
        TelegramInternalMiddleware.Handlers
      ]
    })
  ],
  // ...
})
export class AppModule {}
```

# Multiple bots
In some cases, you may need to run multiple bots at the same time. To do this, just pass a name for each instance in the `TelegramModule` options:
```typescript
import { Module } from '@nestjs/common';
import { TelegramModule } from 'nestjs-puregram';

@Module({
  imports: [
    TelegramModule.forRoot({
      token: 'mycattoken',
      name: 'cat'
    }),
    TelegramModule.forRoot({
      token: 'mydogtoken',
      name: 'dog'
    })
  ],
  // ...
})
export class AppModule {}
```

# Param decorators
The `@Ctx()` or `@Context()` parameter decorators allow you to access the context:
```typescript
import { Update, HearFallback, Ctx } from 'nestjs-puregram';
import { Context } from 'puregram';

@Update()
export class BotUpdate {
  @HearFallback()
  fallback(@Ctx() context: Context): string {
    return `Unknown command: ${context.text}`;
  }
}
```

The `@Next()` parameter decorator allows you to access the `next` function in middleware:
```typescript
import { Update, Use, Ctx, Next } from 'nestjs-puregram';
import { TelegramContext } from 'puregram';
import { NextMiddleware, NextMiddlewareReturn } from 'middleware-io';

@Update()
export class BotUpdate {
  @Use()
  middleware(
    @Ctx() ctx: TelegramContext,
    @Next() next: NextMiddleware
  ): NextMiddlewareReturn {
    this.logger.debug(`New update received: ${ctx.updateId}`);

    return next();
  }
}
```

The `@Matches()` and `@Groups()` parameter decorators allow you to access the `context.$match` and `context.$match.groups`:
```typescript
import { ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { Update, Hears, Matches, Groups } from 'nestjs-puregram';

@Update()
export class BotUpdate {
  @Hears(/^\/test (?<first>\d+) (?<second>true|false)$/i)
  test(
    @Matches(1, new ParseIntPipe()) first: number,
    @Groups('second', new ParseBoolPipe()) second: number
  ): void {
    // /test 2 false => 2 false
    // /test 100 true => 100 true
    console.log(first, second);
  }
}
```
and pipes will work correctly!

# Reply options
You can pass reply options for method returns to `TelegramModule` options:
```typescript
import { Module } from '@nestjs/common';
import { TelegramModule } from 'nestjs-puregram';

@Module({
  imports: [
    TelegramModule.forRoot({
      token: 'mytoken',
      // use `false` to disable
      replyOptions: {
        send: true,
        parse_mode: 'markdown'
      }
    })
  ]
})
export class AppModule {}
```
or decorate class or method with `@ReplyOptions(replyOptions)` decorator:
```typescript
import { Update, Hears, ReplyOptions } from 'nestjs-puregram';

@Update()
export class BotUpdate {
  @Hears(/^\/ping$/i)
  @ReplyOptions({ parse_mode: 'markdown' })
  ping(): string {
    return '***Pong!***';
  }
}
```
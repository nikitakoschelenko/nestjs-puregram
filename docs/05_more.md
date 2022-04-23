# Injection
When you need access to a Telegram instance, you can inject it:
```typescript
constructor(
  @InjectTelegram() private telegram: Telegram
) {}
```

# Middlewares
You can use middlewares for `puregram` before and after others (built-in):
```typescript
@Module({
  imports: [
    TelegramModule.forRoot({
      token: 'mytoken',
      middlewaresBefore: [beforeMiddleware],
      middlewaresAfter: [afterMiddleware]
    })
  ],
  // ...
})
export class AppModule {}
```

# Multiple bots
In some cases, you may need to run multiple bots at the same time. To do this, just pass a name for each instance in the `TelegramModule` options:
```typescript
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
@Update()
export class BotUpdate {
  @Use()
  middleware(
    @Ctx() ctx: TelegramContext,
    @Next() next: NextMiddleware
  ): Promise<unknown> {
    this.logger.debug(`New update received: ${ctx.updateId}`);

    return next();
  }
}
```

The `@Matches()` and `@Groups()` parameter decorators allow you to access the `context.$match` and `context.$match.groups`:
```typescript
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
@Update()
export class BotUpdate {
  @Hears(/^\/ping$/i)
  @ReplyOptions({ parse_mode: 'markdown' })
  ping(): string {
    return '***Pong!***';
  }
}
```
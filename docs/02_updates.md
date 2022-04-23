# Updates

## Longpoll
*Longpolling* is enabled by default. You can disable it by passing `false` to `startPollingOptions`.

## Webhooks
To use webhooks, you must first disable *Longpolling*. Then you need to get the Telegram instance in the main file:
```typescript
import { getTelegramToken } from 'nestjs-puregram';

// if many instances are used, then you can pass the name of the needed
const telegram: Telegram = app.get(getTelegramToken(name?: string));
```
and apply the webhook middleware:
```typescript
app.use(telegram.updates.getWebhookMiddleware());
```
**NOTE**: this only works for *Express* platform.

Also, you will need to call `setWebhook` at least once:
```typescript
telegram.api.setWebhook({
  url: 'mywebhookurl'
});
```

## Getting updates
First of all, you need to decorate class with `@Update()` decorator, it's like NestJS's `@Controller()` decorator, but for Telegram Bot API updates. Then you can use listener decorators like `@Hears(^/\/ping/$)`, `@HearFallback()`, `@On('message')` and `@Use()`:
```typescript
@Update()
export class BotUpdate {
  @On('message')
  onMessage(
    @Ctx() context: MessageContext,
    @Next() next: NextMiddleware
  ): NextMiddlewareReturn {
    this.logger.debug(`New message received: ${context.text}`);

    return next();
  }

  @Hears(/^\/ping$/i)
  ping(): string {
    return 'Pong!';
  }

  @HearFallback()
  fallback(): string {
    return 'Unknown command';
  }
}
```

<h3 dir="rtl">
  <a href="/docs/03_session_and_scenes.md">→ Next</a>
</h3>

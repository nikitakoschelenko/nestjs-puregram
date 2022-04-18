<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>
<p align="center">
  A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.
</p>

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://camo.githubusercontent.com/ae383d0564deaf25b8dba9046f38450cb1568317bb4d536cd9535b5911b0a7b6/68747470733a2f2f692e696d6775722e636f6d2f5a7a6a6d4538692e706e67" width="320" alt="Nest Logo" /></a>
</p>
<p align='center'>
  Powerful and epic overall,
  <code>puregram</code>
  allows you to
  <b>easily interact</b>
  with
  <a href='https://core.telegram.org/bots/api'>Telegram Bot API</a>
  via
  <a href='https://nodejs.org'>Node.js</a>
  😎👍
</p>

# NestJS puregram
Powerful and modern Telegram Bot API SDK for NestJS 😁

## Introduction
This module allows you to use `puregram` in `NestJS`. For example:
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
}
```

[Read `puregram` docs](https://github.com/nitreojs/puregram#readme)

## Installation
```shell
yarn add nestjs-puregram
```
```shell
npm install nestjs-puregram
```

## Basic usage
### Import and register `TelegramModule`
```typescript
@Module({
  imports: [
    // Common registration
    TelegramModule.forRoot({
      token: 'mytoken'
    }),
    // Async registration
    TelegramModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TELEGRAM_TOKEN')
      })
    })
    // ...other
  ]
})
export class AppModule {}
```

### On update
```typescript
@On('message')
onMessage(
  @Ctx() context: MessageContext,
  @Next() next: NextMiddleware
): NextMiddlewareReturn {
  this.logger.debug(`New message received: ${context.text}`);

  return next();
}
```

### Hear (`@puregram/hear`)
```typescript
@Hears(/^\/ping$/i)
ping(@Ctx() context: MessageContext): Promise<unknown> {
  return context.reply('Pong!');
}
```

### Session (`@puregram/session`)
```typescript
@Hears(/^\/ping$/i)
ping(@Ctx() context: MessageContext & SessionInterface): Promise<unknown> {
  const { session } = context;

  if (!session.times) session.times = 0;
  session.times++;

  return context.reply(`You pinged me ${session.times} times`);
}
```

### Scenes (`@puregram/scenes`)
```typescript
@Scene(SIGNUP_SCENE)
export class SignupScene {
  @AddStep()
  name(@Ctx() context: MessageContext & SessionInterface & StepContext): Promise<unknown> {
    if (context.scene.step.firstTime || !context.hasText) {
      return context.send("What's your name?");
    }

    context.scene.state.firstName = context.text;

    return context.scene.step.next();
  }

  @AddStep()
  age(@Ctx() context: MessageContext & SessionInterface & StepContext): Promise<unknown> {
    if (context.scene.step.firstTime || !context.hasText) {
      return context.send('How old are you?');
    }

    context.scene.state.age = Number.parseInt(context.text, 10);

    return context.scene.step.next();
  }

  @AddStep()
  async echo(@Ctx() context: MessageContext & SessionInterface & StepContext): Promise<unknown> {
    const { firstName, age } = context.scene.state;

    await context.send(`You are ${firstName} ${age} years old!`);

    // Automatic exit, since this is the last scene
    return context.scene.step.next();
  }
}
```
## Inject `Telegram` instance:
```typescript
export class BotUpdate {
  constructor(@InjectTelegram() private telegram: Telegram) {}

  onModuleInit(): void {
    this.logger.log(`@${this.telegram.bot.username} started polling updates`);
  }
}
```

# Thanks to
- [nitreojs](https://github.com/nitreojs) ([nitreojs/puregram](https://github.com/nitreojs/puregram)) – original package for Node.js
- [xTCry](https://github.com/xTCry) ([xTCry/nestjs-vk](https://github.com/xTCry/nestjs-vk)) – for inspiration and code
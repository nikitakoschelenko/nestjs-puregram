# Scenes (example with session)
At first, you need to decorate class with `@Scene(slug)` decorator, it's like `@Update()` decorator, but for scenes. Then you can add steps with `@AddStep(step?)` decorator, set `enterHandler` and `leaveHandler` with `@SceneEnter()` and `@SceneLeave()` decorators:
```typescript
import { Scene, SceneEnter, Ctx, SceneLeave, AddStep } from 'nestjs-puregram';
import { Context, MessageContext } from 'puregram';
import { SessionInterface } from '@puregram/session';
import { StepContext } from '@puregram/scenes';

@Scene(SIGNUP_SCENE)
export class SignupScene {
  @SceneEnter()
  enter(@Ctx() context: Context): Promise<unknown> {
    return context.send('Welcome!');
  }

  @SceneLeave()
  leave(@Ctx() context: Context): Promise<unknown> {
    return context.send('Goobye!');
  }

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

Then you need to add your scene to the module providers:
```typescript
import { Module } from '@nestjs/common';
import { TelegramModule } from 'nestjs-puregram';

@Module({
  imports: [
    TelegramModule.forRoot({
      token: 'mytoken'
    })
  ],
  providers: [SignupScene]
})
export class AppModule {}
```

<h3 dir="rtl">
  <a href="/docs/04_nestjs.md">→ Next</a>
</h3>

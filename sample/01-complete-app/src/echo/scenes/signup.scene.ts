import { MessageContext } from 'puregram';
import { StepContext } from '@puregram/scenes';
import { SessionInterface } from '@puregram/session';
import { AddStep, Ctx, Scene, SceneEnter, SceneLeave } from 'nestjs-puregram';

import { SIGNUP_SCENE } from '../echo.constants';

@Scene(SIGNUP_SCENE)
export class SignupScene {
  @SceneEnter()
  enter(@Ctx() context: MessageContext & StepContext): Promise<unknown> {
    if (context.scene.step.firstTime) return context.send('Welcome!');
  }

  @SceneLeave()
  leave(@Ctx() context: MessageContext): Promise<unknown> {
    return context.send('Goobye!');
  }

  @AddStep()
  name(
    @Ctx() context: MessageContext & SessionInterface & StepContext
  ): Promise<unknown> {
    if (context.scene.step.firstTime || !context.hasText) {
      return context.send("What's your name?");
    }

    context.scene.state.firstName = context.text;

    return context.scene.step.next();
  }

  @AddStep()
  age(
    @Ctx() context: MessageContext & SessionInterface & StepContext
  ): Promise<unknown> {
    if (context.scene.step.firstTime || !context.hasText) {
      return context.send('How old are you?');
    }

    context.scene.state.age = Number.parseInt(context.text, 10);

    return context.scene.step.next();
  }

  @AddStep()
  async echo(
    @Ctx() context: MessageContext & SessionInterface & StepContext
  ): Promise<unknown> {
    const { firstName, age } = context.scene.state;

    await context.send(`You are ${firstName} ${age} years old!`);

    // Automatic exit, since this is the last scene
    return context.scene.step.next();
  }
}

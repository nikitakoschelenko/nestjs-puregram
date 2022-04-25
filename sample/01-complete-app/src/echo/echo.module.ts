import { Module } from '@nestjs/common';

import { EchoUpdate } from './echo.update';
import { SignupScene } from './scenes/signup.scene';

@Module({
  providers: [EchoUpdate, SignupScene]
})
export class EchoModule {}

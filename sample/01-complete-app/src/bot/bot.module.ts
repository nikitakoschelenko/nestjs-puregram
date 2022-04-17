import { Module } from '@nestjs/common';

import { BotUpdate } from './bot.update';

@Module({
  providers: [BotUpdate]
})
export class BotModule {}

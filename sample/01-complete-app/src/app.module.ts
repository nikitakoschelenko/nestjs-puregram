import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModule } from 'nestjs-puregram';

import { LoggerMiddleware } from '@/common/middlewares/logger.middleware';
import { BotModule } from '@/bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegramModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TELEGRAM_TOKEN') ?? '',
        middlewaresBefore: [LoggerMiddleware.middleware]
      })
    }),
    BotModule
  ]
})
export class AppModule {}

import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectTelegram, TelegramModule } from 'nestjs-puregram';
import { Telegram } from 'puregram';

import { EchoModule } from '@/echo/echo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegramModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TELEGRAM_TOKEN')
      })
    }),
    EchoModule
  ]
})
export class AppModule {
  private logger: Logger = new Logger(AppModule.name);

  constructor(@InjectTelegram() private telegram: Telegram) {}

  onModuleInit(): void {
    this.logger.log(`@${this.telegram.bot.username} started polling updates`);
  }
}

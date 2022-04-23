# Installation
```shell
yarn add nestjs-puregram
```
```shell
npm install nestjs-puregram
```

# Configuration
Now you can import and register `TelegramModule` in `AppModule`:
```typescript
import { Module } from '@nestjs/common';
import { TelegramModule } from 'nestjs-puregram';

@Module({
  imports: [
    TelegramModule.forRoot({
      token: 'mytoken'
    })
  ]
})
export class AppModule {}
```

# Async configuration
For example, you can use `ConfigService` to setup `TelegramModule`:
```typescript
import { Module } from '@nestjs/common';
import { TelegramModule } from 'nestjs-puregram';

@Module({
  imports: [
    TelegramModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TELEGRAM_TOKEN')
      })
    })
  ]
})
export class AppModule {}
```

<h3 dir="rtl">
  <a href="/docs/02_updates.md">→ Next</a>
</h3>

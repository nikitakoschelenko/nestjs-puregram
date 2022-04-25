import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TelegramArgumentsHost, TelegramException } from 'nestjs-puregram';
import { Context, MessageContext } from 'puregram';

@Catch(TelegramException)
export class TelegramExceptionFilter implements ExceptionFilter {
  catch(exception: TelegramException, host: ArgumentsHost) {
    const context: Context = TelegramArgumentsHost.create(host).getContext();

    if (context.is(['message']) && exception.message) {
      return (context as MessageContext).reply(exception.message);
    }
  }
}

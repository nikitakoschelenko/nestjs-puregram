import { ArgumentsHost } from '@nestjs/common';

export interface TelegramExceptionFilter<T = any> {
  catch(exception: T, host: ArgumentsHost): any;
}

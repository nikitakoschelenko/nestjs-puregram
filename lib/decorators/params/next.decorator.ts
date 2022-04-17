import { TelegramParamtype } from '../../enums/telegram-paramtype.enum';
import { createTelegramParamDecorator } from '../../utils/param-decorator.util';

export const Next: () => ParameterDecorator = createTelegramParamDecorator(
  TelegramParamtype.NEXT
);

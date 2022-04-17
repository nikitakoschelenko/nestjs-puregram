import { DEFAULT_TELEGRAM_NAME } from '../telegram.constants';

export function getTelegramToken(name?: string): string {
  return name && name !== DEFAULT_TELEGRAM_NAME
    ? `${name}Telegram`
    : DEFAULT_TELEGRAM_NAME;
}

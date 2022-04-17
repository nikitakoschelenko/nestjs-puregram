import { Telegram } from 'puregram';

import { TelegramModuleOptions } from '../interfaces';

export async function createTelegramApiFactory(
  options: TelegramModuleOptions
): Promise<Telegram> {
  const telegram = new Telegram({ token: options.token, ...options.options });

  if (options.pollingOptions !== false) {
    await telegram.updates.startPolling(options.pollingOptions);
  }

  return telegram;
}

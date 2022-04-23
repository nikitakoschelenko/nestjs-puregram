import { SetMetadata } from '@nestjs/common';

import { ContextReplyOptions } from '../../interfaces';
import { TELEGRAM_REPLY_OPTIONS_METADATA } from '../../telegram.constants';

export const ReplyOptions = (replyOptions: ContextReplyOptions | false) =>
  SetMetadata(TELEGRAM_REPLY_OPTIONS_METADATA, replyOptions);

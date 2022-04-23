import { SendMessageParams } from 'puregram/lib/methods';
import { Optional } from 'puregram/lib/types';

export interface ContextReplyOptions
  extends Optional<SendMessageParams, 'chat_id' | 'text'> {
  /**
   * Use `send` instead of `reply`
   */
  send?: boolean;
}

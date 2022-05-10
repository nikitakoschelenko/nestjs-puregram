import { SendMessageParams } from 'puregram/methods';
import { Optional } from 'puregram/types';

export interface ContextReplyOptions
  extends Optional<SendMessageParams, 'chat_id' | 'text'> {
  /**
   * Use `send` method instead of `reply` for sending value returned from handler
   */
  send?: boolean;
}

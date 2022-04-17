import { MessageContext } from 'puregram';
import { SessionInterface } from '@puregram/session';
import { StepContext } from '@puregram/scenes';

export type Context = MessageContext & SessionInterface & StepContext;

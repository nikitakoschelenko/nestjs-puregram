import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ListenerMetadata } from '../interfaces';
import {
  TELEGRAM_LISTENERS_METADATA,
  TELEGRAM_SCENE_ACTION_METADATA,
  TELEGRAM_SCENE_METADATA,
  TELEGRAM_SCENE_STEP_METADATA,
  TELEGRAM_UPDATE_METADATA
} from '../telegram.constants';

@Injectable()
export class MetadataAccessorService {
  constructor(private readonly reflector: Reflector) {}

  isUpdate(target: Function): boolean {
    if (!target) return false;
    return !!this.reflector.get(TELEGRAM_UPDATE_METADATA, target);
  }

  isScene(target: Function): boolean {
    if (!target) return false;
    return !!this.reflector.get(TELEGRAM_SCENE_METADATA, target);
  }

  getListenerMetadata(target: Function): ListenerMetadata[] | undefined {
    return this.reflector.get(TELEGRAM_LISTENERS_METADATA, target);
  }

  getSceneMetadata(target: Function): string | undefined {
    return this.reflector.get(TELEGRAM_SCENE_METADATA, target);
  }

  getSceneStepMetadata(target: Function): number | undefined {
    return this.reflector.get(TELEGRAM_SCENE_STEP_METADATA, target);
  }

  getSceneActionMetadata(target: Function): 'enter' | 'leave' {
    return this.reflector.get(TELEGRAM_SCENE_ACTION_METADATA, target);
  }
}

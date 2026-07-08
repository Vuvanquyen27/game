import 'server-only';

import type { SocialPlatform } from '@/lib/constants';
import { instagramService } from './instagram';
import { threadsService } from './threads';
import type { PublishInput, PublishResult } from './types';

/** Chọn service theo nền tảng và publish. */
export function publishToSocial(
  platform: SocialPlatform,
  input: PublishInput,
): Promise<PublishResult> {
  const service =
    platform === 'instagram' ? instagramService : threadsService;
  return service.publish(input);
}

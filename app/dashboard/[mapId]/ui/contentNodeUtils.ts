import type { Platform } from './MindMapContext';

export function platformLabel(platform: Platform): string {
  if (platform === 'LINKEDIN') return 'LinkedIn';
  if (platform === 'FACEBOOK') return 'Facebook';
  return 'Instagram';
}

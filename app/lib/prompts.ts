import { PlatformType } from '@prisma/client';

export function buildPlatformPrompt(args: {
  platform: PlatformType;
  ideaText: string;
}): { system: string; user: string } {
  const idea = args.ideaText.trim();

  const system = [
    'You are an assistant that writes short, platform-aware social posts.',
    'Keep the output concise and scannable.',
    'No markdown headings. No long-form essays.',
    'Return only the final post text.',
  ].join('\n');

  if (args.platform === PlatformType.LINKEDIN) {
    const user = [
      'Write a LinkedIn post based on this idea:',
      `"${idea}"`,
      '',
      'Constraints:',
      '- 900-1400 characters (aim, don’t hard-count)',
      '- Strong hook in the first 1-2 lines',
      '- Clear value and one actionable takeaway',
      '- 0-3 relevant hashtags at the end',
      '- Professional, direct tone (not salesy)',
    ].join('\n');
    return { system, user };
  }

  // FACEBOOK (MVP)
  const user = [
    'Write a Facebook post based on this idea:',
    `"${idea}"`,
    '',
    'Constraints:',
    '- 300-700 characters (aim, don’t hard-count)',
    '- Friendly, conversational tone',
    '- One clear question or CTA to spark comments',
    '- 0-2 emojis maximum',
  ].join('\n');
  return { system, user };
}




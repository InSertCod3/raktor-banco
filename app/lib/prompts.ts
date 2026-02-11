import { PlatformType } from '@prisma/client';

export function buildPlatformPrompt(args: {
  platform: PlatformType | 'INSTAGRAM';
  ideaText: string;
  contextTexts?: string[];
}): { system: string; user: string } {
  const idea = args.ideaText.trim();
  const contextTexts = (args.contextTexts ?? [])
    .map((text) => text.trim())
    .filter(Boolean);
  const contextBlock = contextTexts.length
    ? ['', 'Context from connected idea nodes:', ...contextTexts.map((text, i) => `${i + 1}. ${text}`)]
    : [];

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
      ...contextBlock,
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

  if (args.platform === 'INSTAGRAM') {
    const user = [
      'Write an Instagram caption based on this idea:',
      `"${idea}"`,
      ...contextBlock,
      '',
      'Constraints:',
      '- 120-350 characters (aim, do not hard-count)',
      '- Strong first line and clear message',
      '- 0-2 emojis maximum',
      '- Add 3-6 relevant hashtags at the end',
      '- Friendly, authentic, concise tone',
    ].join('\n');
    return { system, user };
  }

  // FACEBOOK
  const user = [
    'Write a Facebook post based on this idea:',
    `"${idea}"`,
    ...contextBlock,
    '',
    'Constraints:',
    '- 300-700 characters (aim, don’t hard-count)',
    '- Friendly, conversational tone',
    '- One clear question or CTA to spark comments',
    '- 0-2 emojis maximum',
  ].join('\n');
  return { system, user };
}




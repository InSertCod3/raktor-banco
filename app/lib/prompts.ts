import { PlatformType } from '@prisma/client';

export function buildPlatformPrompt(args: {
  platform: PlatformType | 'INSTAGRAM';
  ideaText: string;
  contextTexts?: string[];
  painPointTexts?: string[];
  proofPointTexts?: string[];
}): { system: string; user: string } {
  const idea = args.ideaText.trim();
  const contextTexts = (args.contextTexts ?? [])
    .map((text) => text.trim())
    .filter(Boolean);
  const painPointTexts = (args.painPointTexts ?? [])
    .map((text) => text.trim())
    .filter(Boolean);
  const proofPointTexts = (args.proofPointTexts ?? [])
    .map((text) => text.trim())
    .filter(Boolean);
  const painPointBlock = painPointTexts.length
    ? ['', 'Pain points to address:', ...painPointTexts.map((text, i) => `${i + 1}. ${text}`)]
    : [];
  const proofPointBlock = proofPointTexts.length
    ? ['', 'Proof points to include:', ...proofPointTexts.map((text, i) => `${i + 1}. ${text}`)]
    : [];
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
      ...painPointBlock,
      ...proofPointBlock,
      ...contextBlock,
      '',
      'Constraints:',
      '- 900-1400 characters (aim, don’t hard-count)',
      '- Strong hook in the first 1-2 lines',
      '- Clear value and one actionable takeaway',
      '- If pain/proof points are provided, directly leverage them in the post',
      '- 0-3 relevant hashtags at the end',
      '- Professional, direct tone (not salesy)',
    ].join('\n');
    return { system, user };
  }

  if (args.platform === 'INSTAGRAM') {
    const user = [
      'Write an Instagram caption based on this idea:',
      `"${idea}"`,
      ...painPointBlock,
      ...proofPointBlock,
      ...contextBlock,
      '',
      'Constraints:',
      '- 120-350 characters (aim, do not hard-count)',
      '- Strong first line and clear message',
      '- If pain/proof points are provided, directly leverage them in the caption',
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
    ...painPointBlock,
    ...proofPointBlock,
    ...contextBlock,
    '',
    'Constraints:',
    '- 300-700 characters (aim, don’t hard-count)',
    '- Friendly, conversational tone',
    '- If pain/proof points are provided, directly leverage them in the post',
    '- One clear question or CTA to spark comments',
    '- 0-2 emojis maximum',
  ].join('\n');
  return { system, user };
}

export function buildSuggestionPrompt(args: {
  sourceText: string;
  contextTexts?: string[];
}): { system: string; user: string } {
  const source = args.sourceText.trim();
  const contextTexts = (args.contextTexts ?? []).map((text) => text.trim()).filter(Boolean);
  const contextBlock = contextTexts.length
    ? ['', 'Related context:', ...contextTexts.map((text, i) => `${i + 1}. ${text}`)]
    : [];

  const system = [
    'You are an ideation assistant.',
    'Provide concise, practical advice for improving a source idea.',
    'Return plain text only.',
  ].join('\n');

  const user = [
    'Review this source note and suggest improvements:',
    `"${source}"`,
    ...contextBlock,
    '',
    'Return exactly:',
    '1) One short diagnosis sentence',
    '2) Three actionable suggestions (numbered)',
    '3) One improved draft line',
  ].join('\n');

  return { system, user };
}




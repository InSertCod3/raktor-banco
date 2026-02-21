import { PlatformType } from '@prisma/client';

export function buildPlatformPrompt(args: {
  platform: PlatformType | 'INSTAGRAM';
  ideaText: string;
  contextTexts?: string[];
  painPointTexts?: string[];
  proofPointTexts?: string[];
  toneValues?: string[];
  messagingLength?: 'shortest' | 'shorter' | 'standard' | 'longer' | 'longest';
  keptSentences?: string;
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
  const toneValues = Array.from(new Set((args.toneValues ?? []).map((text) => text.trim()).filter(Boolean)));
  const messagingLength = args.messagingLength ?? 'standard';
  const messagingLengthLabel =
    messagingLength === 'shortest'
      ? 'Shortest'
      : messagingLength === 'shorter'
      ? 'Shorter'
      : messagingLength === 'longer'
      ? 'Longer'
      : messagingLength === 'longest'
      ? 'Longest'
      : 'Standard';
  const toneBlock = toneValues.length
    ? ['', `Tone to use: ${toneValues.join(', ')}`]
    : [];
  const painPointBlock = painPointTexts.length
    ? ['', 'Pain points to address:', ...painPointTexts.map((text, i) => `${i + 1}. ${text}`)]
    : [];
  const proofPointBlock = proofPointTexts.length
    ? ['', 'Proof points to include:', ...proofPointTexts.map((text, i) => `${i + 1}. ${text}`)]
    : [];
  const contextBlock = contextTexts.length
    ? ['', 'Context from connected idea nodes:', ...contextTexts.map((text, i) => `${i + 1}. ${text}`)]
    : [];

  const keptSentencesBlock = args.keptSentences?.trim()
    ? ['', 'Keep these sentences from previous generation:', args.keptSentences.trim()]
    : [];

  const system = [
    'You are an assistant that writes short, platform-aware social posts.',
    'Keep the output concise and scannable.',
    'No markdown headings. No long-form essays.',
    'Return only the final post text.',
  ].join('\n');

  if (args.platform === PlatformType.LINKEDIN) {
    const linkedInLengthConstraint =
      messagingLength === 'shortest'
        ? '- 250-450 characters (aim, don’t hard-count)'
        : messagingLength === 'shorter'
        ? '- 450-700 characters (aim, don’t hard-count)'
        : messagingLength === 'longer'
        ? '- 1200-1700 characters (aim, don’t hard-count)'
        : messagingLength === 'longest'
        ? '- 1700-2400 characters (aim, don’t hard-count)'
        : '- 900-1400 characters (aim, don’t hard-count)';
    const user = [
      'Write a LinkedIn post based on this idea:',
      `"${idea}"`,
      ...toneBlock,
      ...painPointBlock,
      ...proofPointBlock,
      ...contextBlock,
      ...keptSentencesBlock,
      '',
      `Messaging length preference: ${messagingLengthLabel}`,
      '',
      'Constraints:',
      linkedInLengthConstraint,
      '- Strong hook in the first 1-2 lines',
      '- Clear value and one actionable takeaway',
      '- Respect the requested tone style',
      '- If pain/proof points are provided, directly leverage them in the post',
      '- 0-3 relevant hashtags at the end',
      '- Professional, direct tone (not salesy)',
    ].join('\n');
    return { system, user };
  }

  if (args.platform === 'INSTAGRAM') {
    const instagramLengthConstraint =
      messagingLength === 'shortest'
        ? '- 70-130 characters (aim, do not hard-count)'
        : messagingLength === 'shorter'
        ? '- 130-220 characters (aim, do not hard-count)'
        : messagingLength === 'longer'
        ? '- 260-450 characters (aim, do not hard-count)'
        : messagingLength === 'longest'
        ? '- 450-700 characters (aim, do not hard-count)'
        : '- 120-350 characters (aim, do not hard-count)';
    const user = [
      'Write an Instagram caption based on this idea:',
      `"${idea}"`,
      ...toneBlock,
      ...painPointBlock,
      ...proofPointBlock,
      ...contextBlock,
      ...keptSentencesBlock,
      '',
      `Messaging length preference: ${messagingLengthLabel}`,
      '',
      'Constraints:',
      instagramLengthConstraint,
      '- Strong first line and clear message',
      '- Respect the requested tone style',
      '- If pain/proof points are provided, directly leverage them in the caption',
      '- 0-2 emojis maximum',
      '- Add 3-6 relevant hashtags at the end',
      '- Friendly, authentic, concise tone',
    ].join('\n');
    return { system, user };
  }

  // FACEBOOK
  const facebookLengthConstraint =
    messagingLength === 'shortest'
      ? '- 120-240 characters (aim, don’t hard-count)'
      : messagingLength === 'shorter'
      ? '- 220-420 characters (aim, don’t hard-count)'
      : messagingLength === 'longer'
      ? '- 650-1000 characters (aim, don’t hard-count)'
      : messagingLength === 'longest'
      ? '- 950-1400 characters (aim, don’t hard-count)'
      : '- 300-700 characters (aim, don’t hard-count)';
  const user = [
    'Write a Facebook post based on this idea:',
    `"${idea}"`,
    ...toneBlock,
    ...painPointBlock,
    ...proofPointBlock,
    ...contextBlock,
    ...keptSentencesBlock,
    '',
    `Messaging length preference: ${messagingLengthLabel}`,
    '',
    'Constraints:',
    facebookLengthConstraint,
    '- Friendly, conversational tone',
    '- Respect the requested tone style',
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

export function buildSentenceReplacementPrompt(args: {
  platform: PlatformType | 'INSTAGRAM';
  sentence: string;
  fullPostText: string;
}): { system: string; user: string } {
  const platformLabel =
    args.platform === PlatformType.LINKEDIN
      ? 'LinkedIn'
      : args.platform === PlatformType.FACEBOOK
      ? 'Facebook'
      : 'Instagram';

  const system = [
    'You rewrite one sentence for a social post.',
    'Return strict JSON only with this shape: {"suggestions":["...", "...", "..."]}',
    'Each suggestion must be exactly one sentence.',
    'Keep meaning aligned with the original sentence and fit the platform tone.',
    'Do not add markdown or extra keys.',
  ].join('\n');

  const user = [
    `Platform: ${platformLabel}`,
    '',
    'Original sentence:',
    `"${args.sentence.trim()}"`,
    '',
    'Full post for context:',
    `"${args.fullPostText.trim()}"`,
    '',
    'Task:',
    '- Generate 3 replacement sentence options.',
    '- Keep them concise and scannable.',
    '- Do not repeat the exact original sentence.',
  ].join('\n');

  return { system, user };
}



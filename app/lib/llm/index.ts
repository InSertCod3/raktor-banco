import { BaseLlmInterface, type LlmProvider } from '@/app/lib/llm/base';
import { GeminiLlm } from '@/app/lib/llm/gemini';
import { OllamaLlm } from '@/app/lib/llm/ollama';

export function getLlmProvider(): LlmProvider {
  const configured = process.env.LLM_PROVIDER_TYPE?.trim().toLowerCase();
  if (configured === 'gemini' || configured === 'ollama') {
    return configured;
  }

  throw new Error('Invalid or missing LLM_PROVIDER_TYPE. Set it to "gemini" or "ollama".');
}

export function getLlmClient(provider: LlmProvider = getLlmProvider()): BaseLlmInterface {
  switch (provider) {
    case 'ollama':
      return new OllamaLlm();
    case 'gemini':
      return new GeminiLlm();
    default:
      throw new Error(`Unsupported LLM provider: ${String(provider)}`);
  }
}

export async function generateSocialText(args: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  provider?: LlmProvider;
}): Promise<{ outputText: string; model: string; provider: LlmProvider }> {
  const client = getLlmClient(args.provider ?? getLlmProvider());
  const messages = [
    { role: 'system' as const, content: args.systemPrompt },
    { role: 'user' as const, content: args.userPrompt },
  ];

  const generated = await client.generate({
    messages,
    temperature: args.temperature,
  });

  return { ...generated, provider: client.provider };
}

export function streamSocialText(args: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  provider?: LlmProvider;
}): {
  provider: LlmProvider;
  stream: AsyncGenerator<string, { outputText: string; model: string }, void>;
} {
  const client = getLlmClient(args.provider ?? getLlmProvider());
  const messages = [
    { role: 'system' as const, content: args.systemPrompt },
    { role: 'user' as const, content: args.userPrompt },
  ];

  return {
    provider: client.provider,
    stream: client.stream({
      messages,
      temperature: args.temperature,
    }),
  };
}

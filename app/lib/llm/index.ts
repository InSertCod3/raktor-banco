import { BaseLlmInterface, type LlmProvider } from '@/app/lib/llm/base';
import { OllamaLlm } from '@/app/lib/llm/ollama';
import { OpenAILlm } from '@/app/lib/llm/openai';

export function getLlmProvider(): LlmProvider {
  const configured = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (configured === 'openai' || configured === 'ollama') {
    return configured;
  }

  // Safe default: if OpenAI key is present, assume production path.
  return process.env.OPENAI_API_KEY ? 'openai' : 'ollama';
}

export function getLlmClient(provider: LlmProvider = getLlmProvider()): BaseLlmInterface {
  if (provider === 'ollama') {
    return new OllamaLlm();
  }

  return new OpenAILlm();
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

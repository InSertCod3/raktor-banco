import OpenAI from 'openai';
import { BaseLlmInterface, type LlmGenerateArgs, type LlmGenerateResult } from '@/app/lib/llm/base';

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Don't throw at import-time; route handlers should validate env vars.
    throw new Error(
      'Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable.'
    );
  }
  return new OpenAI({ apiKey });
}

export function getOpenAIModelName(): string {
  return process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
}

export class OpenAILlm extends BaseLlmInterface {
  readonly provider = 'openai' as const;

  getModelName(): string {
    return getOpenAIModelName();
  }

  async generate(args: LlmGenerateArgs): Promise<LlmGenerateResult> {
    const model = args.model ?? this.getModelName();
    const openai = getOpenAIClient();

    const resp = await openai.responses.create({
      model,
      temperature: args.temperature ?? 0.2,
      input: args.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    const outputText = resp.output_text?.trim() || '';
    if (!outputText) {
      throw new Error('Model returned an empty response.');
    }

    return { outputText, model };
  }
}

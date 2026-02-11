import { BaseLlmInterface, type LlmGenerateArgs, type LlmGenerateResult } from '@/app/lib/llm/base';

function getOllamaHost(): string {
  return process.env.OLLAMA_HOST?.trim() || 'http://127.0.0.1:11434';
}

export function getOllamaModelName(): string {
  return process.env.OLLAMA_MODEL?.trim() || 'llama3.2:latest';
}

export class OllamaLlm extends BaseLlmInterface {
  readonly provider = 'ollama' as const;

  getModelName(): string {
    return getOllamaModelName();
  }

  async generate(args: LlmGenerateArgs): Promise<LlmGenerateResult> {
    const model = args.model ?? this.getModelName();
    const response = await fetch(`${getOllamaHost()}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        options: { temperature: args.temperature ?? 0.2 },
        messages: args.messages,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Ollama request failed (${response.status}): ${body || response.statusText}`);
    }

    const payload = (await response.json()) as {
      message?: { content?: string };
    };
    const outputText = payload.message?.content?.trim() || '';
    if (!outputText) {
      throw new Error('Model returned an empty response.');
    }

    return { outputText, model };
  }
}

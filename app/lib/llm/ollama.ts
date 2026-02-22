import { BaseLlmInterface, type LlmGenerateArgs, type LlmGenerateResult } from '@/app/lib/llm/base';
import { requireEnv } from '@/app/lib/utils';

function getOllamaHost(): string {
  return requireEnv('OLLAMA_HOST');
}

export function getOllamaModelName(): string {
  return requireEnv('OLLAMA_MODEL');
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

  async *stream(args: LlmGenerateArgs): AsyncGenerator<string, LlmGenerateResult, void> {
    const model = args.model ?? this.getModelName();
    const response = await fetch(`${getOllamaHost()}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: true,
        options: { temperature: args.temperature ?? 0.2 },
        messages: args.messages,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Ollama request failed (${response.status}): ${body || response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Ollama stream body is missing.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let outputText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let lineBreak = buffer.indexOf('\n');

      while (lineBreak >= 0) {
        const line = buffer.slice(0, lineBreak).trim();
        buffer = buffer.slice(lineBreak + 1);
        if (line) {
          const payload = JSON.parse(line) as {
            message?: { content?: string };
            error?: string;
          };
          if (payload.error) {
            throw new Error(payload.error);
          }
          const delta = payload.message?.content ?? '';
          if (delta) {
            outputText += delta;
            yield delta;
          }
        }
        lineBreak = buffer.indexOf('\n');
      }
    }

    const trailing = buffer.trim();
    if (trailing) {
      const payload = JSON.parse(trailing) as {
        message?: { content?: string };
        error?: string;
      };
      if (payload.error) {
        throw new Error(payload.error);
      }
      const delta = payload.message?.content ?? '';
      if (delta) {
        outputText += delta;
        yield delta;
      }
    }

    outputText = outputText.trim();
    if (!outputText) {
      throw new Error('Model returned an empty response.');
    }

    return { outputText, model };
  }
}

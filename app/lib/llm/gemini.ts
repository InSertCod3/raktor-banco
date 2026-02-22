import { GoogleGenAI, type GenerateContentResponse, type GoogleGenAIOptions } from '@google/genai';
import { BaseLlmInterface, type LlmGenerateArgs, type LlmGenerateResult } from '@/app/lib/llm/base';
import { requireEnv } from '@/app/lib/utils';

function getGeminiApiKey(): string {
  return requireEnv('GEMINI_API_KEY');
}

export function getGeminiModelName(): string {
  return requireEnv('GEMINI_MODEL');
}

function getGeminiClient(): GoogleGenAI {
  const options: GoogleGenAIOptions = {
    vertexai: true,
    apiKey: getGeminiApiKey(),
  };

  return new GoogleGenAI(options);
}

function buildGeminiRequest(messages: LlmGenerateArgs['messages'], temperature: number) {
  const systemChunks: string[] = [];
  const contents = messages
    .filter((message) => {
      if (message.role === 'system') {
        const text = message.content.trim();
        if (text) systemChunks.push(text);
        return false;
      }
      return true;
    })
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

  return {
    contents,
    config: {
      temperature,
      systemInstruction: systemChunks.length > 0 ? systemChunks.join('\n\n') : undefined,
    },
  };
}

function buildGeminiEmptyOutputReason(payload: GenerateContentResponse | null): string {
  if (!payload) return '';

  const blockReason = String(payload.promptFeedback?.blockReason ?? '').trim();
  const blockReasonMessage = String(payload.promptFeedback?.blockReasonMessage ?? '').trim();
  const finishReason = String(payload.candidates?.[0]?.finishReason ?? '').trim();

  const reasons = [blockReasonMessage, blockReason && `blockReason=${blockReason}`, finishReason && `finishReason=${finishReason}`]
    .filter(Boolean)
    .join('; ');
  return reasons ? ` ${reasons}` : '';
}

export class GeminiLlm extends BaseLlmInterface {
  readonly provider = 'gemini' as const;

  getModelName(): string {
    return getGeminiModelName();
  }

  async generate(args: LlmGenerateArgs): Promise<LlmGenerateResult> {
    const model = args.model ?? this.getModelName();
    const ai = getGeminiClient();
    const requestBody = buildGeminiRequest(args.messages, args.temperature ?? 0.2);
    const response = await ai.models.generateContent({
      model,
      contents: requestBody.contents,
      config: requestBody.config,
    });

    const outputText = (response.text ?? '').trim();
    if (!outputText) {
      throw new Error(`Model returned an empty response.${buildGeminiEmptyOutputReason(response)}`);
    }

    return { outputText, model };
  }

  async *stream(args: LlmGenerateArgs): AsyncGenerator<string, LlmGenerateResult, void> {
    const model = args.model ?? this.getModelName();
    const ai = getGeminiClient();
    const requestBody = buildGeminiRequest(args.messages, args.temperature ?? 0.2);
    let outputText = '';
    let lastChunk: GenerateContentResponse | null = null;
    const stream = await ai.models.generateContentStream({
      model,
      contents: requestBody.contents,
      config: requestBody.config,
    });

    for await (const chunk of stream) {
      lastChunk = chunk;
      const delta = chunk.text ?? '';
      if (!delta) continue;
      outputText += delta;
      yield delta;
    }

    outputText = outputText.trim();
    if (!outputText) {
      throw new Error(`Model returned an empty response.${buildGeminiEmptyOutputReason(lastChunk)}`);
    }

    return { outputText, model };
  }
}

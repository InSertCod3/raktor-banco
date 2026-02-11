export type LlmProvider = 'openai' | 'ollama';

export type LlmMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LlmGenerateArgs = {
  messages: LlmMessage[];
  temperature?: number;
  model?: string;
};

export type LlmGenerateResult = {
  outputText: string;
  model: string;
};

export abstract class BaseLlmInterface {
  abstract readonly provider: LlmProvider;
  abstract getModelName(): string;
  abstract generate(args: LlmGenerateArgs): Promise<LlmGenerateResult>;
}

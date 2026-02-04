import OpenAI from 'openai';

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

export function getModelName(): string {
  return process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
}



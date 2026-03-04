import { GoogleGenAI, type GoogleGenAIOptions } from "@google/genai";
import { requireEnv } from "@/app/lib/utils";

function getGeminiApiKey(): string {
  return requireEnv("GEMINI_API_KEY");
}

export function getGeminiVisionModel(): string {
  return process.env.GEMINI_VISION_MODEL?.trim() || "gemini-2.5-flash";
}

function getGeminiClient(): GoogleGenAI {
  const options: GoogleGenAIOptions = {
    vertexai: true,
    apiKey: getGeminiApiKey(),
  };
  return new GoogleGenAI(options);
}

export async function describeImageWithGeminiFlash(file: File): Promise<string | null> {
  const bytes = Buffer.from(await file.arrayBuffer());
  return describeFileWithGeminiFlash({
    mimeType: file.type,
    bytes,
    instruction:
      "Write a concise factual description of this image in under 80 words. Focus on visible elements only.",
  });
}

export async function describeFileWithGeminiFlash(input: {
  mimeType: string;
  bytes: Buffer;
  instruction?: string;
}): Promise<string | null> {
  const supported = new Set(["image/jpeg", "image/png", "application/pdf"]);
  if (!supported.has(input.mimeType)) return null;

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: getGeminiVisionModel(),
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              input.instruction ??
              "Write a concise factual description in under 80 words. For PDFs, summarize core purpose and key information.",
          },
          {
            inlineData: {
              mimeType: input.mimeType,
              data: input.bytes.toString("base64"),
            },
          },
        ],
      },
    ],
    config: {
      temperature: 0.1,
    },
  });

  const output = (response.text ?? "").trim();
  return output || null;
}

/** Server-side AI credentials — never import this module from client components. */

export interface AiProviderConfig {
  openai: boolean;
  gemini: boolean;
  openaiModel: string;
  geminiModel: string;
}

export function getAiProviderConfig(): AiProviderConfig {
  const geminiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    '';

  return {
    openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
    gemini: Boolean(geminiKey && geminiKey.length >= 20),
    openaiModel: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
    geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
  };
}

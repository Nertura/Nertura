import Anthropic from '@anthropic-ai/sdk';

import type { Lead } from './db';

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514';

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function generateOutreachDraft(lead: Lead): Promise<{ subject: string; body: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const client = new Anthropic({ apiKey });

  const prompt = `Sen Nertura adlı yapay zeka destekli tarım zekası platformunun B2B satış yazarısın.
Aşağıdaki firmaya kişiselleştirilmiş, kısa ve profesyonel bir tanıtım e-postası yaz (Türkçe).

Firma: ${lead.company}
Sektör: ${lead.sector}
İletişim kişisi: ${lead.name ?? 'Yetkili'}
E-posta: ${lead.email}

Kurallar:
- Konu satırı (subject) ve gövde (body) üret
- Nertura'nın AI Tarım Doktoru, bitki hastalığı teşhisi ve bilgi bankasını kısaca anlat
- Satış baskısı yapma, değer odaklı ol
- Maksimum 180 kelime gövde
- JSON formatında yanıt ver: {"subject":"...","body":"..."}`;

  const message = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  const raw = textBlock && 'text' in textBlock ? textBlock.text : '';

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? raw) as { subject?: string; body?: string };
    if (!parsed.subject || !parsed.body) throw new Error('Invalid draft shape');
    return { subject: parsed.subject.trim(), body: parsed.body.trim() };
  } catch {
    return {
      subject: `${lead.company} için Nertura AI Tarım Asistanı`,
      body: raw.trim() || `Merhaba,\n\nNertura ile ${lead.sector} sektöründeki operasyonlarınızı AI ile güçlendirebilirsiniz.\n\nSaygılarımızla,\nNertura Ekibi`,
    };
  }
}

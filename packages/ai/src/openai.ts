import type { DoctorAnswer, KnowledgeHit, RiskLevel } from './types';
import { DOCTOR_DISCLAIMER } from './types';

interface StructuredResponse {
  diagnosis?: string;
  symptoms?: string;
  risk_level?: RiskLevel;
  treatment?: string;
  prevention?: string;
  notes?: string;
  confidence?: number;
}

export async function analyzeWithOpenAI(params: {
  question: string;
  visionContext?: string | null;
  knowledgeHits?: KnowledgeHit[];
  knowledgeContext?: string;
}): Promise<{ answer: Omit<DoctorAnswer, 'disclaimer' | 'source'>; raw: unknown } | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const kbContext =
    params.knowledgeContext ??
    (params.knowledgeHits ?? [])
      .map((h) => `- ${h.name_en} (${h.type}): ${h.summary_tr ?? h.summary_en ?? ''}`)
      .join('\n');

  const system = `You are Nertura AI Agriculture Doctor — a global agriculture expert.
Respond ONLY with valid JSON:
{
  "diagnosis": "string",
  "symptoms": "string",
  "risk_level": "low|medium|high|critical",
  "treatment": "string",
  "prevention": "string",
  "notes": "string",
  "confidence": 0.0-1.0
}
Use the same language as the user's question (English or Turkish).
Be practical, safe, and actionable. Lower confidence when uncertain.`;

  const userParts = [
    `Question: ${params.question}`,
    params.visionContext ? `Gemini vision analysis:\n${params.visionContext}` : '',
    kbContext ? `Knowledge base context:\n${kbContext}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userParts },
      ],
      max_tokens: 1000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const rawContent = json.choices?.[0]?.message?.content;
  if (!rawContent) return null;

  try {
    const parsed = JSON.parse(rawContent) as StructuredResponse;
    return {
      answer: {
        diagnosis: parsed.diagnosis ?? 'Teşhis belirlenemedi',
        symptoms: parsed.symptoms ?? 'Belirtilmemiş',
        risk_level: parsed.risk_level ?? 'medium',
        treatment: parsed.treatment ?? 'Belirtilmemiş',
        prevention: parsed.prevention ?? 'Belirtilmemiş',
        notes: parsed.notes ?? '',
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.65)),
      },
      raw: json,
    };
  } catch {
    return null;
  }
}

export function buildMockAnswer(question: string): Omit<DoctorAnswer, 'disclaimer'> {
  const q = question.toLowerCase();

  if (q.includes('olive') || q.includes('zeytin')) {
    return {
      diagnosis:
        'Zeytin ağaçlarında yaprak sorunları — olası nedenler: besin eksikliği, fungal leke (cycloconium), zararlı baskısı veya su stresi.',
      symptoms: 'Yaprak lekelenmesi, sararma, dökülme veya kuruma; genelde alt yapraklardan başlayabilir.',
      risk_level: 'medium',
      treatment:
        'Budama ile havalandırma sağlayın. Bakır preparatı veya etiketli fungisit (fungal leke için). Toprak analizi ile besin dengesini kontrol edin.',
      prevention:
        'Düzenli budama, yabani ot temizliği, sulama dengesi, dayanıklı çeşit, erken mücadele.',
      notes: 'Zeytin için bakır uygulamalarında hasat öncesi bekleme süresine dikkat edin.',
      confidence: 0.65,
      source: 'mock',
    };
  }

  if (q.includes('tomato') || q.includes('domates')) {
    return {
      diagnosis:
        'Domates yapraklarında sararma — olası nedenler: azot/magnezyum eksikliği, aşırı sulama, erken fungal/bakteriyel baskı veya kök sorunu.',
      symptoms:
        'Alt yapraklardan başlayan sararma, solgunluk, bazen kahverengi lekeler veya yaprak dökülmesi.',
      risk_level: 'medium',
      treatment:
        'Toprak analizi yapın. Dengeli NPK ve gerekirse magnezyum uygulayın. Sulama düzenini gözden geçirin. Ciddi lekelenme varsa etiketli fungisit veya uzman desteği alın.',
      prevention:
        'Drenajı iyileştirin, aşırı sulamadan kaçının, rotasyon uygulayın, dayanıklı çeşit seçin, düzenli gözlem yapın.',
      notes:
        'Sararmanın alt/üst yaprakta mı başladığı ve tek taraflı mı olduğu teşhis için önemlidir. Fotoğraf yüklerseniz daha net yönlendirme yapılabilir.',
      confidence: 0.62,
      source: 'mock',
    };
  }

  return {
    diagnosis:
      'Genel tarım danışmanlığı yanıtı — yapay zeka anahtarları yapılandırılmamış, bilgi bankası eşleşmesi sınırlı.',
    symptoms: question.slice(0, 200),
    risk_level: 'low',
    treatment:
      'Bitkinin türünü, belirtileri ve büyüme dönemini netleştirin. Yerel iklim, toprak ve sulama koşullarını gözden geçirin.',
    prevention: 'Düzenli gözlem, doğru gübreleme, dengeli sulama ve erken müdahale planı oluşturun.',
    notes:
      'Full AI diagnosis available when OPENAI_API_KEY and GEMINI_API_KEY are configured server-side.',
    confidence: 0.4,
    source: 'mock',
  };
}

export { DOCTOR_DISCLAIMER };

import { NextResponse } from 'next/server';

import { runFindLeads, runGenerateDrafts, runWeeklyOutreach } from '@/lib/outreach/pipeline';
import { sendAdminNotification } from '@/lib/outreach/resend';

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

/** Vercel Cron: every Monday 08:00 UTC — find leads, generate drafts, notify admin */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sector = process.env.OUTREACH_DEFAULT_SECTOR ?? 'sera';
    const result = await runWeeklyOutreach(sector);

    await sendAdminNotification({
      subject: `[Nertura Outreach] Haftalık otomasyon tamamlandı`,
      body: [
        `Sektör: ${sector}`,
        `Web araması bulunan: ${result.leadsFound}`,
        `Eklenen lead: ${result.leadsInserted}`,
        result.draftsConfigured
          ? `Üretilen taslak: ${result.draftsCreated}`
          : 'Taslak üretimi atlandı (ANTHROPIC_API_KEY yok)',
        `Kalan 'yeni' lead: ${result.newLeadCount}`,
        '',
        'Outreach mailleri otomatik gönderilmez. Kurucu onayı gerekir: /outreach',
      ].join('\n'),
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cron failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action') ?? 'weekly';

  try {
    if (action === 'find-leads') {
      const sector = url.searchParams.get('sector') ?? process.env.OUTREACH_DEFAULT_SECTOR ?? 'sera';
      const result = await runFindLeads(sector);
      return NextResponse.json(result);
    }

    if (action === 'generate-drafts') {
      const result = await runGenerateDrafts();
      return NextResponse.json(result);
    }

    const sector = process.env.OUTREACH_DEFAULT_SECTOR ?? 'sera';
    const result = await runWeeklyOutreach(sector);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Action failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

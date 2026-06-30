'use client';

import type { DoctorDiagnosis } from '@nertura/types';
import { Card, CardContent, CardHeader, CardTitle } from '@nertura/ui';

function confidenceLabel(value: number): string {
  const pct = Math.round(value * 100);
  if (pct >= 80) return 'Yüksek';
  if (pct >= 55) return 'Orta';
  return 'Düşük';
}

const RISK_LABELS: Record<string, string> = {
  low: 'Düşük / Low',
  medium: 'Orta / Medium',
  high: 'Yüksek / High',
  critical: 'Kritik / Critical',
};

export function DiagnosisCard({ diagnosis }: { diagnosis: DoctorDiagnosis }) {
  const pct = Math.round(diagnosis.confidence * 100);

  return (
    <Card className="max-w-lg border-signal/20 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-void">AI Tarım Doktoru Raporu</CardTitle>
        <p className="text-xs text-muted-foreground">
          Güven: {pct}% ({confidenceLabel(diagnosis.confidence)})
          {diagnosis.matched_type ? ` · ${diagnosis.matched_type}` : ''}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Section title="Ön Teşhis / Diagnosis" content={diagnosis.diagnosis} />
        <Section title="Belirtiler / Symptoms" content={diagnosis.symptoms} />
        <Section
          title="Risk Seviyesi / Risk Level"
          content={RISK_LABELS[diagnosis.risk_level] ?? diagnosis.risk_level}
        />
        <Section title="Önerilen Tedavi / Treatment" content={diagnosis.treatment} />
        <Section title="Önleme / Prevention" content={diagnosis.prevention} />
        <Section title="Ek Notlar / Notes" content={diagnosis.notes} />
        <p className="border-t pt-3 text-xs text-muted-foreground italic">
          {diagnosis.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="font-medium text-void">{title}</p>
      <p className="text-muted-foreground">{content}</p>
    </div>
  );
}

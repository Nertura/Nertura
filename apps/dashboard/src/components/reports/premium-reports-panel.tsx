'use client';

import { FileText, Lock } from 'lucide-react';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@nertura/ui';

import {
  PREMIUM_REPORT_ACTIONS,
  type PremiumReportAction,
  isPremiumReportsEnabled,
} from '@/lib/credits/premium-reports';

interface PremiumReportsPanelProps {
  fieldId?: string | null;
  caseId?: string | null;
}

function ReportRow({ action, disabled }: { action: PremiumReportAction; disabled: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{action.label}</p>
        <p className="text-xs text-muted-foreground">{action.description}</p>
      </div>
      <Button type="button" size="sm" variant="outline" disabled={disabled} className="shrink-0">
        {disabled ? (
          <>
            <Lock className="mr-1 h-3.5 w-3.5" />
            Yakında
          </>
        ) : (
          `${action.credits} hak`
        )}
      </Button>
    </div>
  );
}

export function PremiumReportsPanel({ fieldId, caseId }: PremiumReportsPanelProps) {
  const enabled = isPremiumReportsEnabled();

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4" />
          Premium tarla raporları
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Tarla, ürün, vaka ve Bilgi Bankası bağlamından PDF dışa aktarma. Ödeme altyapısı
          hazır olana kadar ücretlendirme yok.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {!fieldId && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Rapor bağlamı için bir tarla seçin.
          </p>
        )}
        {PREMIUM_REPORT_ACTIONS.map((action) => (
          <ReportRow
            key={action.id}
            action={action}
            disabled={!enabled || !fieldId || Boolean(action.comingSoon)}
          />
        ))}
        {caseId && (
          <p className="pt-1 text-[11px] text-muted-foreground">Vaka bağlamı: {caseId.slice(0, 8)}…</p>
        )}
      </CardContent>
    </Card>
  );
}

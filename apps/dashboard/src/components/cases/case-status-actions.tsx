'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@nertura/ui';

interface CaseStatusActionsProps {
  caseId: string;
  status: string;
}

export function CaseStatusActions({ caseId, status }: CaseStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function runAction(action: 'monitor' | 'resolve' | 'reopen') {
    setLoading(action);
    try {
      const res = await fetch(`/api/field-cases/${caseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'İşlem başarısız');
      }
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== 'monitoring' && status !== 'resolved' ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading !== null}
          onClick={() => void runAction('monitor')}
        >
          {loading === 'monitor' ? 'Kaydediliyor…' : 'Takibe Al'}
        </Button>
      ) : null}
      {status !== 'resolved' ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading !== null}
          onClick={() => void runAction('resolve')}
        >
          {loading === 'resolve' ? 'Kaydediliyor…' : 'Çözüldü Olarak İşaretle'}
        </Button>
      ) : null}
      {status === 'resolved' ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading !== null}
          onClick={() => void runAction('reopen')}
        >
          {loading === 'reopen' ? 'Kaydediliyor…' : 'Yeniden Aç'}
        </Button>
      ) : null}
    </div>
  );
}

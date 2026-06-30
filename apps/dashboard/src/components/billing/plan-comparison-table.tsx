import type { SubscriptionTierId } from '@/lib/billing/subscription-tiers';
import { SUBSCRIPTION_TIERS, TIER_COMPARISON_ROWS } from '@/lib/billing/subscription-tiers';

interface PlanComparisonTableProps {
  currentTier: SubscriptionTierId;
}

export function PlanComparisonTable({ currentTier }: PlanComparisonTableProps) {
  const tiers: SubscriptionTierId[] = ['free', 'plus', 'pro', 'enterprise'];

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Özellik</th>
            {tiers.map((id) => (
              <th key={id} className="px-4 py-3 font-medium">
                {SUBSCRIPTION_TIERS[id].name}
                {id === currentTier && (
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    Mevcut
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIER_COMPARISON_ROWS.map((row) => (
            <tr key={row.label} className="border-b last:border-0">
              <td className="px-4 py-3 text-muted-foreground">{row.label}</td>
              {tiers.map((id) => {
                const val = row[id];
                return (
                  <td key={id} className="px-4 py-3 text-center">
                    {typeof val === 'boolean' ? (
                      val ? (
                        <span className="text-primary" aria-label="Dahil">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground" aria-label="Dahil değil">
                          —
                        </span>
                      )
                    ) : (
                      val
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

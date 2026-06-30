'use client';



import { Lock, X } from 'lucide-react';



import { Button, cn, OverlayPortal } from '@nertura/ui';



import { UPGRADE_COPY } from '@/lib/navigation-tier';



interface UpgradeModalProps {

  open: boolean;

  onClose: () => void;

  onUpgrade?: () => void;

}



export function UpgradeModal({ open, onClose, onUpgrade }: UpgradeModalProps) {

  if (!open) return null;



  return (

    <OverlayPortal>

      <button

        type="button"

        className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-[2px] animate-fade-in"

        aria-label={UPGRADE_COPY.dismiss}

        onClick={onClose}

      />

      <div

        role="dialog"

        aria-modal="true"

        aria-labelledby="upgrade-modal-title"

        className="fixed left-1/2 top-1/2 z-[90] w-[min(calc(100%-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 animate-fade-in rounded-3xl border border-border/70 bg-card p-6 shadow-xl"

      >

        <div className="flex items-start justify-between gap-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">

            <Lock className="h-5 w-5" aria-hidden />

          </div>

          <button

            type="button"

            onClick={onClose}

            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

            aria-label={UPGRADE_COPY.dismiss}

          >

            <X className="h-5 w-5" />

          </button>

        </div>



        <h2 id="upgrade-modal-title" className="mt-4 text-lg font-semibold leading-snug text-foreground">

          {UPGRADE_COPY.title}

        </h2>



        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">

          {UPGRADE_COPY.features.map((feature) => (

            <li key={feature} className="flex items-center gap-2">

              <span className="text-primary" aria-hidden>

                ✓

              </span>

              {feature}

            </li>

          ))}

        </ul>



        <div className="mt-6 flex flex-col gap-2 sm:flex-row">

          <Button

            type="button"

            className="h-11 flex-1 rounded-xl"

            onClick={() => {

              onUpgrade?.();

              onClose();

            }}

          >

            {UPGRADE_COPY.cta}

          </Button>

          <Button

            type="button"

            variant="outline"

            className={cn('h-11 flex-1 rounded-xl')}

            onClick={onClose}

          >

            {UPGRADE_COPY.dismiss}

          </Button>

        </div>

      </div>

    </OverlayPortal>

  );

}


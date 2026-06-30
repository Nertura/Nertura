'use client';

import { Bell } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Button, cn } from '@nertura/ui';

import { FIELD_COPY } from '@/lib/i18n/field-copy';

export function NotificationsBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className={cn('relative', className)}>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={FIELD_COPY.notifications.label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" />
      </Button>
      {open &&
        mounted &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={FIELD_COPY.notifications.label}
            className="fixed z-[100] w-72 overflow-hidden rounded-lg border bg-card shadow-lg animate-fade-in pointer-events-auto"
            style={{ top: coords.top, right: coords.right }}
          >
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium text-void">{FIELD_COPY.notifications.label}</p>
            </div>
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" aria-hidden />
              <p className="mt-3 text-sm font-medium text-void">{FIELD_COPY.notifications.allCaughtUp}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {FIELD_COPY.notifications.emptyHint}
              </p>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

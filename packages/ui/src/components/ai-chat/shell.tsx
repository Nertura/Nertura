'use client';

import { History, MessageSquarePlus, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';
import { Button } from '../button';
import { OverlayPortal } from '../overlay-portal';

export interface HistoryItem {
  id: string;
  title: string | null;
  updated_at: string;
}

interface AiChatHeaderProps {
  onNewChat: () => void;
  onOpenHistory?: () => void;
  showHistory?: boolean;
  usageHint?: string | null;
  trailing?: ReactNode;
  className?: string;
  labels?: {
    newChat?: string;
    history?: string;
  };
}

export function AiChatHeader({
  onNewChat,
  onOpenHistory,
  showHistory = false,
  usageHint,
  trailing,
  className,
  labels,
}: AiChatHeaderProps) {
  const newLabel = labels?.newChat ?? 'New';
  const historyLabel = labels?.history ?? 'History';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6',
        className
      )}
    >
      <div className="flex items-center gap-1">
        {showHistory && onOpenHistory && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onOpenHistory}
            aria-label={historyLabel}
          >
            <History className="h-5 w-5" />
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onNewChat} className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          <span className="hidden sm:inline">{newLabel}</span>
        </Button>
      </div>

      {usageHint && (
        <p className="hidden text-xs text-muted-foreground sm:block">{usageHint}</p>
      )}

      <div className="flex items-center gap-2">{trailing}</div>
    </header>
  );
}

interface AiChatHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  items: HistoryItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
  labels?: {
    title?: string;
    close?: string;
    loading?: string;
    empty?: string;
    untitled?: string;
  };
}

export function AiChatHistoryDrawer({
  open,
  onClose,
  items,
  activeId,
  onSelect,
  loading,
  labels,
}: AiChatHistoryDrawerProps) {
  if (!open) return null;

  const title = labels?.title ?? 'History';
  const closeLabel = labels?.close ?? 'Close history';
  const loadingLabel = labels?.loading ?? 'Loading…';
  const emptyLabel = labels?.empty ?? 'Your questions will appear here.';
  const untitledLabel = labels?.untitled ?? 'Untitled question';

  return (
    <OverlayPortal>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] animate-fade-in"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 left-0 z-[70] flex w-[min(100%,20rem)] flex-col border-r bg-card shadow-2xl animate-slide-up"
        aria-label={title}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <p className="font-medium text-void">{title}</p>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {loading && <p className="px-3 py-4 text-sm text-muted-foreground">{loadingLabel}</p>}
          {!loading && items.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground">{emptyLabel}</p>
          )}
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  className={cn(
                    'w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                    activeId === item.id
                      ? 'bg-primary/10 font-medium text-void'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="line-clamp-2">{item.title ?? untitledLabel}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </OverlayPortal>
  );
}

interface AiChatShellProps {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  historyDrawer?: ReactNode;
}

export function AiChatShell({ header, children, footer, historyDrawer }: AiChatShellProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {historyDrawer}
      {header}
      <main className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      {footer ? <div className="shrink-0">{footer}</div> : null}
    </div>
  );
}

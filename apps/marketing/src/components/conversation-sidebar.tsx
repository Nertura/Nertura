'use client';

import { MessageSquarePlus } from 'lucide-react';

import { Button } from '@nertura/ui';

export interface ConversationItem {
  id: string;
  title: string | null;
  updated_at: string;
}

interface ConversationSidebarProps {
  conversations: ConversationItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  loading?: boolean;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  loading,
}: ConversationSidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-muted/30">
      <div className="border-b p-3">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onNewChat}
        >
          <MessageSquarePlus className="h-4 w-4" />
          New question
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Conversation history">
        {loading && (
          <p className="px-2 py-3 text-xs text-muted-foreground">Loading history…</p>
        )}

        {!loading && conversations.length === 0 && (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            Your questions will appear here.
          </p>
        )}

        <ul className="space-y-1">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeId === c.id
                    ? 'bg-background font-medium text-void shadow-sm'
                    : 'text-muted-foreground hover:bg-background/60 hover:text-void'
                }`}
              >
                <span className="line-clamp-2">{c.title ?? 'Untitled question'}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

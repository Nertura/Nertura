'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import { AiChatHistoryDrawer, Button, cn, getDoctorUiCopy, OverlayPortal, type HistoryItem } from '@nertura/ui';

import { FieldCasesPanel } from '@/components/doctor/field-cases-panel';
import { getDashboardCopy, type DashboardLocale } from '@/lib/i18n/dashboard-copy';
import type { FieldCaseRow } from '@/lib/intake/field-case-service';

type DrawerTab = 'history' | 'cases';

interface DoctorSideDrawerProps {
  open: boolean;
  onClose: () => void;
  tab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
  historyItems: HistoryItem[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  historyLoading?: boolean;
  selectedFieldId?: string | null;
  activeCaseId?: string | null;
  locale?: DashboardLocale;
}

export function DoctorSideDrawer({
  open,
  onClose,
  tab,
  onTabChange,
  historyItems,
  activeConversationId,
  onSelectConversation,
  historyLoading,
  selectedFieldId,
  activeCaseId,
  locale = 'tr',
}: DoctorSideDrawerProps) {
  const doctorCopy = getDashboardCopy(locale).doctor;
  const shellCopy = getDoctorUiCopy(locale).shell;
  const router = useRouter();

  if (!open) return null;

  const handleSelectCase = (caseRow: FieldCaseRow) => {
    const params = new URLSearchParams();
    params.set('caseId', caseRow.id);
    if (caseRow.field_id) params.set('fieldId', caseRow.field_id);
    if (caseRow.raw_intake) params.set('q', caseRow.raw_intake);
    router.push(`/doctor?${params.toString()}`);
    onClose();
  };

  if (tab === 'history') {
    return (
      <AiChatHistoryDrawer
        open={open}
        onClose={onClose}
        items={historyItems}
        activeId={activeConversationId}
        onSelect={onSelectConversation}
        loading={historyLoading}
        labels={{
          title: shellCopy.history,
          close: shellCopy.closeHistory,
          loading: doctorCopy.historyLoading,
          empty: doctorCopy.historyEmpty,
          untitled: doctorCopy.untitledQuestion,
        }}
      />
    );
  }

  return (
    <OverlayPortal>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] animate-fade-in"
        aria-label={doctorCopy.closeSidebar}
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 left-0 z-[70] flex w-[min(100%,22rem)] flex-col border-r bg-card shadow-2xl animate-slide-up"
        aria-label={doctorCopy.fieldCases}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex gap-1">
            <TabButton active={false} onClick={() => onTabChange('history')}>
              {doctorCopy.history}
            </TabButton>
            <TabButton active onClick={() => onTabChange('cases')}>
              {doctorCopy.fieldCases}
            </TabButton>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <FieldCasesPanel
            selectedFieldId={selectedFieldId}
            activeCaseId={activeCaseId}
            onSelectCase={handleSelectCase}
            locale={locale}
          />
        </div>
      </aside>
    </OverlayPortal>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

export function DoctorHistoryDrawerWithTabs({
  open,
  onClose,
  tab,
  onTabChange,
  historyItems,
  activeConversationId,
  onSelectConversation,
  historyLoading,
  selectedFieldId,
  activeCaseId,
  locale = 'tr',
}: DoctorSideDrawerProps) {
  const doctorCopy = getDashboardCopy(locale).doctor;
  const shellCopy = getDoctorUiCopy(locale).shell;

  if (!open) return null;

  if (tab === 'cases') {
    return (
      <DoctorSideDrawer
        open={open}
        onClose={onClose}
        tab="cases"
        onTabChange={onTabChange}
        historyItems={historyItems}
        activeConversationId={activeConversationId}
        onSelectConversation={onSelectConversation}
        historyLoading={historyLoading}
        selectedFieldId={selectedFieldId}
        activeCaseId={activeCaseId}
        locale={locale}
      />
    );
  }

  return (
    <OverlayPortal>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] animate-fade-in"
        aria-label={doctorCopy.closeHistory}
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 left-0 z-[70] flex w-[min(100%,22rem)] flex-col border-r bg-card shadow-2xl animate-slide-up"
        aria-label={doctorCopy.history}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex gap-1">
            <TabButton active onClick={() => onTabChange('history')}>
              {doctorCopy.history}
            </TabButton>
            <TabButton active={false} onClick={() => onTabChange('cases')}>
              {doctorCopy.fieldCases}
            </TabButton>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {historyLoading && (
            <p className="px-3 py-4 text-sm text-muted-foreground">{doctorCopy.historyLoading}</p>
          )}
          {!historyLoading && historyItems.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground">{doctorCopy.historyEmpty}</p>
          )}
          <ul className="space-y-1">
            {historyItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectConversation(item.id);
                    onClose();
                  }}
                  className={cn(
                    'w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                    activeConversationId === item.id
                      ? 'bg-primary/10 font-medium text-void'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="line-clamp-2">
                    {item.title ?? doctorCopy.untitledQuestion}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </OverlayPortal>
  );
}

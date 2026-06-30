'use client';

import { ArrowUp, Camera, ImagePlus, Loader2, Mic, Plus } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';

import {
  AppComposerShell,
  AppTextarea,
  Button,
  cn,
  composerTextareaClassName,
} from '@nertura/ui';

import { DashboardAuthAnchor } from '@/components/dashboard-auth-link';

interface GuestHomeComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder: string;
  onLockedAction: () => void;
  footerNote?: ReactNode;
  centered?: boolean;
  sendLabel: string;
  addLabel: string;
  photoLabel: string;
  galleryLabel: string;
  voiceLabel: string;
  cancelLabel: string;
  lockedFooter: string;
  lockedSignup: string;
}

export function GuestHomeComposer({
  value,
  onChange,
  onSubmit,
  loading,
  disabled,
  placeholder,
  onLockedAction,
  footerNote,
  centered = false,
  sendLabel,
  addLabel,
  photoLabel,
  galleryLabel,
  voiceLabel,
  cancelLabel,
  lockedFooter,
  lockedSignup,
}: GuestHomeComposerProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        addButtonRef.current &&
        !addButtonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  function handleLockedClick() {
    setMenuOpen(false);
    onLockedAction();
  }

  const lockedItems = [
    { label: photoLabel, icon: Camera },
    { label: galleryLabel, icon: ImagePlus },
    { label: voiceLabel, icon: Mic },
  ];

  return (
    <div
      className={cn(
        centered
          ? 'relative mx-auto w-full max-w-[860px] px-3 sm:px-4'
          : 'sticky bottom-0 border-t border-border/40 bg-gradient-to-t from-background via-background/95 to-transparent pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-sm'
      )}
    >
      <div className={cn(!centered && 'mx-auto w-full max-w-[960px] px-4 sm:px-6')}>
        {footerNote ? <div className="mb-2 flex justify-center">{footerNote}</div> : null}

        <AppComposerShell onSubmit={onSubmit}>
          <div className="relative shrink-0">
            <button
              ref={addButtonRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              disabled={loading}
              aria-label={addLabel}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
            </button>

            {menuOpen && !isMobile && (
              <div
                ref={menuRef}
                role="dialog"
                aria-label={addLabel}
                className="absolute bottom-full left-0 z-50 mb-2 w-56 animate-fade-in overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg"
              >
                <ul className="py-1">
                  {lockedItems.map(({ label, icon: Icon }) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={handleLockedClick}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted/50"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border/60 px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground">{lockedFooter}</p>
                  <button
                    type="button"
                    onClick={handleLockedClick}
                    className="mt-1 text-sm font-medium text-primary hover:underline"
                  >
                    {lockedSignup} →
                  </button>
                </div>
              </div>
            )}
          </div>

          <AppTextarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || loading}
            rows={1}
            aria-label={placeholder}
            className={composerTextareaClassName}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />

          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl"
            disabled={disabled || loading || !value.trim()}
            aria-label={sendLabel}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </Button>
        </AppComposerShell>

        {menuOpen && isMobile && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-fade-in"
              aria-label={cancelLabel}
              onClick={() => setMenuOpen(false)}
            />
            <div
              ref={menuRef}
              role="dialog"
              aria-label={addLabel}
              className="fixed inset-x-0 bottom-0 z-50 animate-slide-up rounded-t-[1.75rem] border-t border-border/70 bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />
              <ul className="space-y-1">
                {lockedItems.map(({ label, icon: Icon }) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={handleLockedClick}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-base text-foreground transition-colors hover:bg-muted/50 active:bg-muted"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                      {label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-base text-muted-foreground transition-colors hover:bg-muted/50"
                  >
                    {cancelLabel}
                  </button>
                </li>
              </ul>
              <div className="mt-2 border-t border-border/60 py-4 text-center">
                <p className="text-sm text-muted-foreground">{lockedFooter}</p>
                <button
                  type="button"
                  onClick={handleLockedClick}
                  className="mt-1 text-sm font-medium text-primary"
                >
                  {lockedSignup} →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface GuestSignupPromptProps {
  title: string;
  body: string;
  signupLabel: string;
  loginLabel: string;
  signupUrl: string;
  loginUrl: string;
  linksReady?: boolean;
}

export function GuestSignupPrompt({
  title,
  body,
  signupLabel,
  loginLabel,
  signupUrl,
  loginUrl,
  linksReady = true,
}: GuestSignupPromptProps) {
  return (
    <div
      role="dialog"
      aria-live="polite"
      className="animate-fade-in mx-auto max-w-lg rounded-2xl border border-primary/20 bg-primary/[0.04] px-5 py-4 shadow-sm"
    >
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <DashboardAuthAnchor
          href={signupUrl}
          ready={linksReady}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          {signupLabel}
        </DashboardAuthAnchor>
        <DashboardAuthAnchor
          href={loginUrl}
          ready={linksReady}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          {loginLabel}
        </DashboardAuthAnchor>
      </div>
    </div>
  );
}

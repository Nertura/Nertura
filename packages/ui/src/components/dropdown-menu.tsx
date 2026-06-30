'use client';

import { createPortal } from 'react-dom';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { cn } from '../lib/utils';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'end';
  className?: string;
  triggerClassName?: string;
}

export function DropdownMenu({
  trigger,
  children,
  align = 'end',
  className,
  triggerClassName,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 8,
      left: rect.left,
      right: window.innerWidth - rect.right,
    });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
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
    <div className={cn('relative inline-flex', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={cn(
          'inline-flex border-0 bg-transparent p-0 text-left font-inherit text-inherit cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg',
          triggerClassName
        )}
      >
        {trigger}
      </button>
      {open &&
        mounted &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            className="fixed z-[100] min-w-[12rem] overflow-hidden rounded-lg border bg-card py-1 shadow-lg animate-fade-in pointer-events-auto"
            style={{
              top: coords.top,
              ...(align === 'end' ? { right: coords.right } : { left: coords.left }),
            }}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  href,
  destructive,
  className,
}: DropdownMenuItemProps) {
  const base = cn(
    'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted focus:bg-muted focus:outline-none',
    destructive ? 'text-destructive' : 'text-foreground',
    className
  );

  if (href) {
    return (
      <a href={href} role="menuitem" className={base} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" role="menuitem" className={base} onClick={onClick}>
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-3 py-2 text-xs font-medium text-muted-foreground', className)}>
      {children}
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

import { cn, OverlayPortal } from '@nertura/ui';

const DEFAULT_ALT = 'Yüklenen fotoğraf';
const DEFAULT_CLOSE = 'Kapat';
const DEFAULT_OPEN = 'Fotoğrafı tam ekran aç';

export interface ChatImageLightboxProps {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
  closeLabel?: string;
}

export function ChatImageLightbox({
  src,
  alt = DEFAULT_ALT,
  open,
  onClose,
  closeLabel = DEFAULT_CLOSE,
}: ChatImageLightboxProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <OverlayPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        onClick={onClose}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label={closeLabel}
        >
          <X className="h-5 w-5" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </OverlayPortal>
  );
}

export interface ChatMessageImageProps {
  src: string;
  alt?: string;
  className?: string;
  onOpen: () => void;
  openLabel?: string;
}

export function ChatMessageImage({
  src,
  alt = 'Fotoğraf',
  className,
  onOpen,
  openLabel = DEFAULT_OPEN,
}: ChatMessageImageProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group relative mt-2 block overflow-hidden rounded-xl border border-border/60',
        className
      )}
      aria-label={openLabel}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="max-h-48 w-full max-w-[240px] object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
        <ZoomIn className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100" />
      </span>
    </button>
  );
}

/**
 * Accessible modal dialog.
 *
 * Replaces four hand-rolled overlays that shared the same defects:
 *   - no `role="dialog"` / `aria-modal`, so screen readers never announced them
 *   - no focus management: focus stayed on the page behind the overlay and
 *     Tab walked straight out of the dialog
 *   - no Escape-to-close
 *   - no focus restore, so closing dropped the user back at the top of the document
 *   - the page behind kept scrolling
 *
 * Implements the WAI-ARIA Authoring Practices dialog pattern.
 */

import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Short supporting line under the title; also used as the accessible description. */
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Additional classes for the panel (max-width, etc.). */
  className?: string;
  /** Hide the built-in header block when the caller provides its own. */
  hideHeader?: boolean;
  labelledById?: string;
  closeOnBackdropClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className = 'max-w-2xl',
  hideHeader = false,
  closeOnBackdropClick = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  /* --- Focus trap + Escape --- */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      // Visibility is determined structurally rather than via `offsetParent`,
      // which is null in jsdom and for elements inside a `position: fixed`
      // subtree — either of which would silently shrink the focusable set to
      // one element and break the trap.
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.closest('[hidden]') && el.getAttribute('aria-hidden') !== 'true');

      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Move focus into the dialog so keyboard and screen-reader users start inside it.
    const panel = panelRef.current;
    if (panel) {
      const firstFocusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? panel).focus();
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, handleKeyDown]);

  /* --- Prevent the page behind from scrolling --- */
  useEffect(() => {
    if (!isOpen) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    // Compensate for the removed scrollbar so the page does not jump sideways.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  /* --- Restore focus to the trigger on close --- */
  useEffect(() => {
    if (isOpen) return;
    const target = previouslyFocused.current;
    if (target && document.contains(target)) {
      target.focus();
      previouslyFocused.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      // Click-outside-to-close is a mouse convenience. Keyboard users close with
      // Escape, so the backdrop itself is deliberately not a tab stop or control.
      role="presentation"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-start sm:items-center justify-center p-3 sm:p-6"
      onMouseDown={(event) => {
        if (closeOnBackdropClick && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`bg-white rounded-2xl w-full ${className} shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] outline-none`}
      >
        {!hideHeader && (
          <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50 shrink-0">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors shrink-0"
              aria-label={`Close ${title}`}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 min-h-0">{children}</div>

        {footer && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Announces a message to screen readers without moving focus.
 * WCAG 4.1.3 Status Messages.
 */
export function LiveRegion({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

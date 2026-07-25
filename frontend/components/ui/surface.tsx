import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-wide',
        tone === 'neutral' && 'bg-[var(--surface-2)] text-[var(--ink-muted)]',
        tone === 'accent' && 'bg-[var(--accent-soft)] text-[var(--accent-deep)]',
        tone === 'ok' && 'bg-[var(--ok-soft)] text-[var(--ok)]',
        tone === 'warn' && 'bg-[var(--warn-soft)] text-[var(--warn)]',
        tone === 'danger' && 'bg-[var(--danger-soft)] text-[var(--danger)]',
        className,
      )}
      {...props}
    />
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Surface({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[var(--shadow-sm)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

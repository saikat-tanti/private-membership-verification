'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  Handshake,
  ScrollText,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn, shortAddr } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/surface';
import { useWallet } from '@/lib/wallet-context';
import { networkLabel } from '@/lib/config';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/membership', label: 'Membership', icon: ShieldCheck },
  { href: '/sponsors', label: 'Sponsors', icon: Handshake },
  { href: '/logs', label: 'Logs', icon: ScrollText },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

function WalletChip() {
  const {
    wallet,
    connecting,
    laceInstalled,
    laceReady,
    connect,
    disconnect,
    walletError,
    laceStoreUrl,
  } = useWallet();

  if (!laceReady) {
    return <Badge tone="neutral">Detecting wallet…</Badge>;
  }

  if (!laceInstalled) {
    return (
      <a
        href={laceStoreUrl}
        target="_blank"
        rel="noreferrer"
        className="text-xs font-medium text-[var(--accent-deep)] underline-offset-2 hover:underline"
      >
        Install Lace
      </a>
    );
  }

  if (wallet) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="ok">Connected</Badge>
        <code className="hidden max-w-[140px] truncate text-xs text-[var(--ink-muted)] sm:inline">
          {shortAddr(wallet.state.address)}
        </code>
        <Button variant="ghost" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="accent" onClick={() => void connect()} disabled={connecting}>
        {connecting ? 'Connecting…' : 'Connect Lace'}
      </Button>
      {walletError ? (
        <span className="hidden max-w-[180px] truncate text-xs text-[var(--danger)] lg:inline">
          {walletError}
        </span>
      ) : null}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { config } = useWallet();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <div className="app-grid pointer-events-none fixed inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto flex min-h-screen max-w-[1400px]">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 border-r border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur-md transition-transform lg:static lg:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-[var(--line)] px-5">
            <Link href="/" className="font-display text-lg tracking-tight text-[var(--ink)]">
              Private Membership
            </Link>
            <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[var(--accent-soft)] text-[var(--accent-deep)]'
                      : 'text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--line)] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">Network</p>
            <p className="mt-1 text-sm text-[var(--ink)]">{networkLabel(config.network)}</p>
          </div>
        </aside>

        {open ? (
          <button
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            aria-label="Close overlay"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--paper)]/90 px-4 backdrop-blur-md sm:px-6">
            <button
              className="rounded-md p-2 text-[var(--ink-muted)] hover:bg-[var(--surface-2)] lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <Badge tone="accent">Midnight ZK</Badge>
              <span className="text-xs text-[var(--ink-faint)]">Allowlist access</span>
            </div>
            <div className="ml-auto">
              <WalletChip />
            </div>
          </header>
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

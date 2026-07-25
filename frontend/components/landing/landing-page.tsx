'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowRight, Shield, EyeOff, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/wallet-context';
import { networkLabel } from '@/lib/config';
import { shortAddr } from '@/lib/utils';

export function LandingPage() {
  const { wallet, connecting, laceInstalled, laceReady, connect, config } = useWallet();
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <div className="landing-grain pointer-events-none fixed inset-0" aria-hidden />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <p className="font-display text-xl tracking-tight sm:text-2xl">Private Membership</p>
        <div className="flex items-center gap-3">
          {wallet ? (
            <span className="hidden text-xs text-[var(--ink-muted)] sm:inline">
              {shortAddr(wallet.state.address)}
            </span>
          ) : laceReady && laceInstalled ? (
            <Button variant="ghost" size="sm" onClick={() => void connect()} disabled={connecting}>
              {connecting ? 'Connecting…' : 'Connect wallet'}
            </Button>
          ) : null}
          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center rounded-md bg-[var(--accent)] px-3 text-xs font-medium text-white hover:bg-[var(--accent-deep)]"
          >
            Open app
          </Link>
        </div>
      </header>

      <section
        ref={heroRef}
        className="landing-hero relative mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-6xl flex-col justify-end overflow-hidden px-5 pb-16 pt-10 sm:px-8 sm:pb-24"
      >
        <div className="landing-hero__plane absolute inset-0 -z-10" aria-hidden />
        <div className="landing-hero__veil absolute inset-0 -z-10" aria-hidden />

        <div className="landing-rise max-w-xl">
          <p className="font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            Private Membership
          </p>
          <h1 className="mt-6 max-w-md text-lg font-medium leading-snug text-[var(--ink)] sm:text-xl">
            Prove allowlist membership without revealing your secret or identity.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--ink-muted)]">
            Zero-knowledge verification on Midnight. Public ledger shows the group name and verified
            count — nothing else.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/membership"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-[var(--accent)] px-6 text-base font-medium text-white transition-colors hover:bg-[var(--accent-deep)]"
            >
              Verify membership
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center rounded-md border border-[var(--line)] bg-[var(--paper)]/80 px-6 text-base font-medium backdrop-blur-sm transition-colors hover:bg-[var(--surface-2)]"
            >
              View dashboard
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--ink-faint)]">
            {networkLabel(config.network)}
            {wallet ? ' · Lace connected' : connecting ? ' · Connecting Lace…' : ''}
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-3">
          {[
            {
              icon: Shield,
              title: 'Private allowlist',
              body: 'Membership secrets stay as private circuit witnesses. They are never written to the public ledger.',
            },
            {
              icon: EyeOff,
              title: 'Identity sealed',
              body: 'Observers see that a valid verification happened. They cannot learn who verified or which code was used.',
            },
            {
              icon: Fingerprint,
              title: 'Public accountability',
              body: 'Group name and verified member count remain public so communities can measure growth without doxxing members.',
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className="landing-feature"
              style={{ animationDelay: `${0.08 * (i + 1)}s` }}
            >
              <item.icon className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.75} />
              <h2 className="mt-4 font-display text-xl tracking-tight">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--line)] px-5 py-10 text-center text-xs text-[var(--ink-faint)] sm:px-8">
        Private Membership Verification · Midnight Network · ZK allowlist access
      </footer>
    </div>
  );
}

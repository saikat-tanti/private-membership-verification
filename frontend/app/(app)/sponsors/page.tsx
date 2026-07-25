'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { PageHeader, Surface, Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addSponsor, listSponsors, removeSponsor, type SponsorSeat } from '@/lib/sponsors';
import { pushActivity } from '@/lib/activity';
import { useWallet } from '@/lib/wallet-context';

export default function SponsorsPage() {
  const { publicState, wallet } = useWallet();
  const [rows, setRows] = useState<SponsorSeat[]>([]);
  const [orgName, setOrgName] = useState('');
  const [groupLabel, setGroupLabel] = useState('');
  const [seats, setSeats] = useState('10');
  const [notes, setNotes] = useState('');

  const reload = () => setRows(listSponsors());

  useEffect(() => {
    reload();
    const onChange = () => reload();
    window.addEventListener('pmv:sponsors', onChange);
    return () => window.removeEventListener('pmv:sponsors', onChange);
  }, []);

  useEffect(() => {
    if (publicState?.groupName && !groupLabel) {
      setGroupLabel(publicState.groupName);
    }
  }, [publicState, groupLabel]);

  const totalSeats = rows.reduce((sum, r) => sum + r.seats, 0);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const seatCount = Number.parseInt(seats, 10);
    if (!orgName.trim() || !Number.isFinite(seatCount) || seatCount <= 0) return;
    const row = addSponsor({
      orgName: orgName.trim(),
      groupLabel: groupLabel.trim() || publicState?.groupName || 'Allowlist group',
      seats: seatCount,
      notes: notes.trim(),
    });
    pushActivity(
      'sponsor_create',
      `Sponsor added: ${row.orgName}`,
      `${row.seats} seats for ${row.groupLabel}`,
    );
    setOrgName('');
    setSeats('10');
    setNotes('');
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Sponsors"
        description="Register organizations that underwrite private membership seats. Seat records stay in this workspace; on-chain proofs still hide individual members."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Surface>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-faint)]">Sponsors</p>
          <p className="mt-2 font-display text-3xl">{rows.length}</p>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-faint)]">Sponsored seats</p>
          <p className="mt-2 font-display text-3xl">{totalSeats}</p>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-faint)]">On-chain verified</p>
          <p className="mt-2 font-display text-3xl">
            {publicState ? publicState.verifiedMemberCount.toString() : '—'}
          </p>
        </Surface>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Surface>
          <h2 className="font-display text-xl">Add sponsor</h2>
          {!wallet ? (
            <p className="mt-2 text-sm text-[var(--warn)]">
              Connect Lace to attribute ops to a connected operator wallet (recommended).
            </p>
          ) : null}
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <div>
              <label className="mb-1 block text-sm text-[var(--ink-muted)]">Organization</label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--ink-muted)]">Allowlist group</label>
              <Input value={groupLabel} onChange={(e) => setGroupLabel(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--ink-muted)]">Seats sponsored</label>
              <Input
                type="number"
                min={1}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--ink-muted)]">Notes</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Quarterly grant, partner cohort…"
              />
            </div>
            <Button type="submit" variant="accent">
              Save sponsor
            </Button>
          </form>
        </Surface>

        <Surface>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Sponsor roster</h2>
            <Badge tone="neutral">{rows.length} orgs</Badge>
          </div>
          {rows.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">No sponsors yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--line)]">
              {rows.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{row.orgName}</p>
                    <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
                      {row.seats} seats · {row.groupLabel}
                    </p>
                    {row.notes ? (
                      <p className="mt-1 text-xs text-[var(--ink-faint)]">{row.notes}</p>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove sponsor"
                    onClick={() => {
                      removeSponsor(row.id);
                      reload();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>
    </div>
  );
}

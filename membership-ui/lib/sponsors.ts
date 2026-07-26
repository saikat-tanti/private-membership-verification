export interface SponsorSeat {
  id: string;
  orgName: string;
  groupLabel: string;
  seats: number;
  notes: string;
  createdAt: string;
}

const STORAGE_KEY = 'pmv:sponsors';

function readRaw(): SponsorSeat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SponsorSeat[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(rows: SponsorSeat[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function listSponsors(): SponsorSeat[] {
  return readRaw();
}

export function addSponsor(input: Omit<SponsorSeat, 'id' | 'createdAt'>): SponsorSeat {
  const row: SponsorSeat = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  writeRaw([row, ...readRaw()]);
  window.dispatchEvent(new CustomEvent('pmv:sponsors'));
  return row;
}

export function removeSponsor(id: string) {
  writeRaw(readRaw().filter((r) => r.id !== id));
  window.dispatchEvent(new CustomEvent('pmv:sponsors'));
}

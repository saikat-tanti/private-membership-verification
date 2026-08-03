export type ActivityKind =
  | 'wallet_connect'
  | 'wallet_disconnect'
  | 'verify_attempt'
  | 'verify_success'
  | 'verify_error'
  | 'deploy_attempt'
  | 'deploy_success'
  | 'deploy_error'
  | 'sponsor_create'
  | 'settings_update';

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  title: string;
  detail?: string;
  at: string;
}

const STORAGE_KEY = 'pmv:activity-log';
const MAX_EVENTS = 80;

function readRaw(): ActivityEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ActivityEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(events: ActivityEvent[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
}

export function listActivity(): ActivityEvent[] {
  return readRaw();
}

export function pushActivity(
  kind: ActivityKind,
  title: string,
  detail?: string,
): ActivityEvent {
  const event: ActivityEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    title,
    detail,
    at: new Date().toISOString(),
  };
  const next = [event, ...readRaw()].slice(0, MAX_EVENTS);
  writeRaw(next);
  window.dispatchEvent(new CustomEvent('pmv:activity', { detail: event }));
  return event;
}

export function clearActivity() {
  writeRaw([]);
  window.dispatchEvent(new CustomEvent('pmv:activity'));
}

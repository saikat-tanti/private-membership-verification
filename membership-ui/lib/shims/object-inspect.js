// ESM shim for CJS object-inspect (compact-runtime default import).
export default function inspect(value, _opts) {
  try {
    if (typeof value === 'string') return JSON.stringify(value);
    return JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
  } catch {
    return String(value);
  }
}

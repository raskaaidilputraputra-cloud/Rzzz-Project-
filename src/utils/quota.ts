export interface QuotaData {
  timestamps: number[];
}

const STORAGE_KEY = 'rzzhd_quota_usage_v2';
export const MAX_QUOTA_PER_24H = 3;
export const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours in ms

export function getClientId(): string {
  try {
    let id = localStorage.getItem('rzzhd_client_device_id');
    if (!id) {
      id = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('rzzhd_client_device_id', id);
    }
    return id;
  } catch (e) {
    return 'client_default';
  }
}

export function getClientQuota(): {
  used: number;
  remaining: number;
  canUse: boolean;
  resetInMs: number;
  nextResetFormatted: string;
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    let timestamps: number[] = [];

    if (raw) {
      const parsed: QuotaData = JSON.parse(raw);
      // Filter only timestamps within the last 24 hours
      timestamps = (parsed.timestamps || []).filter((ts) => now - ts < WINDOW_MS);
    }

    const used = timestamps.length;
    const remaining = Math.max(0, MAX_QUOTA_PER_24H - used);
    const canUse = remaining > 0;

    let resetInMs = 0;
    if (timestamps.length > 0) {
      // Oldest timestamp will reset first
      const oldest = Math.min(...timestamps);
      resetInMs = Math.max(0, WINDOW_MS - (now - oldest));
    }

    const hours = Math.floor(resetInMs / (1000 * 60 * 60));
    const minutes = Math.floor((resetInMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((resetInMs % (1000 * 60)) / 1000);

    const nextResetFormatted =
      hours > 0 ? `${hours}j ${minutes}m` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    return {
      used,
      remaining,
      canUse,
      resetInMs,
      nextResetFormatted,
    };
  } catch (e) {
    return {
      used: 0,
      remaining: MAX_QUOTA_PER_24H,
      canUse: true,
      resetInMs: 0,
      nextResetFormatted: '0m',
    };
  }
}

export function recordQuotaUsage(): { remaining: number; resetInMs: number } {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(STORAGE_KEY);
    let timestamps: number[] = [];

    if (raw) {
      const parsed: QuotaData = JSON.parse(raw);
      timestamps = (parsed.timestamps || []).filter((ts) => now - ts < WINDOW_MS);
    }

    timestamps.push(now);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamps }));

    return {
      remaining: Math.max(0, MAX_QUOTA_PER_24H - timestamps.length),
      resetInMs: WINDOW_MS,
    };
  } catch (e) {
    return { remaining: 2, resetInMs: WINDOW_MS };
  }
}

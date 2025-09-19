// Stores: { dateKey: 'YYYY-MM-DD', data: [...], savedAt: epoch_ms }
const STORAGE_KEY = 'sheet_json_cache';

function todayKey() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getCachedSheet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || obj.dateKey !== todayKey() || !Array.isArray(obj.data)) return null;
    return obj.data;
  } catch (e) {
    return null;
  }
}

export function setCachedSheet(dataArray) {
  try {
    const payload = {
      dateKey: todayKey(),
      data: Array.isArray(dataArray) ? dataArray : [],
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // ignore quota/serialization errors silently
  }
}

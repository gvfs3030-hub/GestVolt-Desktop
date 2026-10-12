const inMemorySecrets = new Map<string, string>();

export async function getItemAsync(key: string): Promise<string | null> {
  const storageKey = `gestvolt-secure-store:${key}`;
  try {
    const value = window.localStorage.getItem(storageKey);
    if (value !== null) return value;
  } catch { /* localStorage may be unavailable for a file origin; use memory fallback */ }
  return inMemorySecrets.get(storageKey) ?? null;
}

export async function setItemAsync(key: string, value: string, _options?: any): Promise<void> {
  const storageKey = `gestvolt-secure-store:${key}`;
  inMemorySecrets.set(storageKey, value);
  try { window.localStorage.setItem(storageKey, value); } catch { /* Desktop SQLite file is protected by Electron safeStorage when available. */ }
}

import { beforeEach, vi } from 'vitest';

// Install before importing Zustand stores; beforeAll runs after module creation.
const items = new Map<string, string>();
const storage: Storage = {
  getItem: (key) => items.get(key) ?? null,
  setItem: (key, value) => { items.set(key, String(value)); },
  removeItem: (key) => { items.delete(key); },
  clear: () => items.clear(),
  key: (index) => [...items.keys()][index] ?? null,
  get length() { return items.size; },
};
vi.stubGlobal('localStorage', storage);
beforeEach(() => storage.clear());

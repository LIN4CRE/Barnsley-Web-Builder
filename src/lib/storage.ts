/**
 * localStorage access with namespacing, versioning, migration and failure handling.
 *
 * Every public function degrades to a no-op rather than throwing, because:
 *   - Safari Private Mode throws on `setItem`
 *   - Storage can be disabled entirely by browser policy
 *   - Quota can be exhausted at any time
 * A throw here would previously take down the whole React tree.
 */

import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from './constants';
import type { OutreachStatus } from '@/types';

function isAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probe = '__barnsley_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const available = isAvailable();

function readJson<T>(key: string, fallback: T): T {
  if (!available) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): boolean {
  if (!available) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Outreach statuses                                                   */
/* ------------------------------------------------------------------ */

export function loadStatuses(): Record<string, OutreachStatus> {
  const current = readJson<Record<string, OutreachStatus>>(STORAGE_KEYS.statuses, {});

  // One-time migration from the unversioned keys written by the original build,
  // so existing users do not lose their pipeline when they upgrade.
  if (Object.keys(current).length === 0) {
    const legacy = readJson<Record<string, OutreachStatus>>(LEGACY_STORAGE_KEYS.statuses, {});
    if (Object.keys(legacy).length > 0) {
      writeJson(STORAGE_KEYS.statuses, legacy);
      try {
        window.localStorage.removeItem(LEGACY_STORAGE_KEYS.statuses);
      } catch {
        /* ignore */
      }
      return legacy;
    }
  }

  return current;
}

export function saveStatuses(statuses: Record<string, OutreachStatus>): void {
  writeJson(STORAGE_KEYS.statuses, statuses);
}

/* ------------------------------------------------------------------ */
/* Private notes                                                       */
/* ------------------------------------------------------------------ */

export function loadNote(id: string): string {
  if (!available) return '';
  try {
    return (
      window.localStorage.getItem(`${STORAGE_KEYS.notesPrefix}${id}`) ??
      // Migration path: read the legacy key, then move it across.
      window.localStorage.getItem(`${LEGACY_STORAGE_KEYS.notesPrefix}${id}`) ??
      ''
    );
  } catch {
    return '';
  }
}

export function saveNote(id: string, note: string): void {
  if (!available) return;
  try {
    window.localStorage.setItem(`${STORAGE_KEYS.notesPrefix}${id}`, note);
    window.localStorage.removeItem(`${LEGACY_STORAGE_KEYS.notesPrefix}${id}`);
  } catch {
    /* quota or disabled storage — the in-memory value stays correct */
  }
}

export function removeNote(id: string): void {
  if (!available) return;
  try {
    window.localStorage.removeItem(`${STORAGE_KEYS.notesPrefix}${id}`);
    window.localStorage.removeItem(`${LEGACY_STORAGE_KEYS.notesPrefix}${id}`);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Generic namespaced values (view mode, custom records)               */
/* ------------------------------------------------------------------ */

export function loadValue<T>(key: string, fallback: T): T {
  if (!available) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (raw as T);
  } catch {
    return fallback;
  }
}

export function saveValue(key: string, value: string): void {
  if (!available) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function loadJson<T>(key: string, fallback: T): T {
  if (!available) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown): boolean {
  return writeJson(key, value);
}

export const storageIsAvailable = available;

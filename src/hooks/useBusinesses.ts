/**
 * Directory state — the single source of truth for businesses, outreach status
 * and private notes.
 *
 * Fixes a data-loss defect in the original build: businesses added manually or
 * imported from the AI scanner were held only in React state, so they vanished on
 * refresh. Status and notes were persisted; the records themselves were not.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BARNSLEY_BUSINESSES } from '@/data/businesses';
import { fetchBusinesses } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';
import { parseBusinessList } from '@/lib/schema';
import {
  loadJson,
  loadNote,
  loadStatuses,
  removeNote,
  saveJson,
  saveNote,
  saveStatuses,
} from '@/lib/storage';
import type { BusinessItem, DataSource, OutreachStatus } from '@/types';

const DEFAULT_STATUS: OutreachStatus = 'Not Contacted';

/** Merge persisted outreach state onto a list of records. */
function hydrate(
  records: readonly BusinessItem[],
  statuses: Record<string, OutreachStatus>,
): BusinessItem[] {
  return records.map((b) => ({
    ...b,
    status: statuses[b.id] ?? b.status ?? DEFAULT_STATUS,
    // `||` is deliberate: an empty stored note should fall back to the record's
    // own note rather than being preserved as a blank.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    notes: loadNote(b.id) || b.notes || '',
  }));
}

export interface UseBusinessesResult {
  businesses: BusinessItem[];
  dataSource: DataSource;
  setBusinesses: React.Dispatch<React.SetStateAction<BusinessItem[]>>;
  addBusinesses: (items: readonly BusinessItem[]) => number;
  updateStatus: (id: string, status: OutreachStatus) => void;
  bulkUpdateStatus: (ids: readonly string[], status: OutreachStatus) => void;
  updateNote: (id: string, note: string) => void;
  removeCustomBusiness: (id: string) => void;
  customCount: number;
}

export function useBusinesses(): UseBusinessesResult {
  const [bundled] = useState<BusinessItem[]>(() => BARNSLEY_BUSINESSES.map((b) => ({ ...b })));
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [dataSource, setDataSource] = useState<DataSource>('loading');

  // Refs keep the persist effect from re-running on every list change.
  const customIdsRef = useRef<Set<string>>(new Set());
  const [customCount, setCustomCount] = useState(0);

  /* ---------------- Initial load ---------------- */
  useEffect(() => {
    let cancelled = false;

    const storedStatuses = loadStatuses();
    const storedCustom = parseBusinessList(loadJson<unknown[]>(STORAGE_KEYS.customBusinesses, []));

    // Show something immediately rather than an empty screen.
    const initial = hydrate([...storedCustom, ...bundled], storedStatuses);
    setBusinesses(initial);
    setDataSource('cache');

    void fetchBusinesses(bundled).then(({ businesses: serverList, fromServer }) => {
      if (cancelled) return;

      // Records the user added always win over the bundled copy and are never
      // discarded just because the server response did not contain them.
      const serverIds = new Set(serverList.map((b) => b.id));
      const merged = fromServer
        ? [
            ...storedCustom.filter((c) => !serverIds.has(c.id)),
            ...serverList,
          ]
        : [...storedCustom, ...bundled];

      setBusinesses(hydrate(merged, storedStatuses));
      setDataSource(fromServer ? 'server' : 'bundled');
    });

    return () => {
      cancelled = true;
    };
  }, [bundled]);

  /* ---------------- Persist user-added records ---------------- */
  useEffect(() => {
    if (dataSource === 'loading') return;

    const custom = businesses.filter((b) => b.isUserAdded === true);
    const ids = new Set(custom.map((b) => b.id));

    // Only write when the set of custom records actually changed.
    const previous = customIdsRef.current;
    const changed =
      previous.size !== ids.size || Array.from(ids).some((id) => !previous.has(id));

    if (changed) {
      saveJson(STORAGE_KEYS.customBusinesses, custom);
      customIdsRef.current = ids;
      setCustomCount(custom.length);
    }
  }, [businesses, dataSource]);

  /* ---------------- Mutations ---------------- */

  const addBusinesses = useCallback((items: readonly BusinessItem[]): number => {
    let added = 0;

    setBusinesses((prev) => {
      const existingIds = new Set(prev.map((b) => b.id));
      const storedStatuses = loadStatuses();

      const fresh = items
        .filter((item) => !existingIds.has(item.id))
        .map((item) => ({
          ...item,
          isUserAdded: true as const,
          addedAt: item.addedAt ?? new Date().toISOString(),
          status: storedStatuses[item.id] ?? DEFAULT_STATUS,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          notes: loadNote(item.id) || item.notes || '',
        }));

      added = fresh.length;
      if (fresh.length === 0) return prev;

      return [...fresh, ...prev];
    });

    return added;
  }, []);

  const updateStatus = useCallback((id: string, status: OutreachStatus) => {
    setBusinesses((prev) => {
      const statuses = loadStatuses();
      statuses[id] = status;
      saveStatuses(statuses);
      return prev.map((b) => (b.id === id ? { ...b, status } : b));
    });
  }, []);

  const bulkUpdateStatus = useCallback((ids: readonly string[], status: OutreachStatus) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);

    setBusinesses((prev) => {
      const statuses = loadStatuses();
      ids.forEach((id) => {
        statuses[id] = status;
      });
      saveStatuses(statuses);
      return prev.map((b) => (idSet.has(b.id) ? { ...b, status } : b));
    });
  }, []);

  const updateNote = useCallback((id: string, note: string) => {
    saveNote(id, note);
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, notes: note } : b)));
  }, []);

  const removeCustomBusiness = useCallback((id: string) => {
    removeNote(id);
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const stableBusinesses = useMemo(() => businesses, [businesses]);

  return {
    businesses: stableBusinesses,
    dataSource,
    setBusinesses,
    addBusinesses,
    updateStatus,
    bulkUpdateStatus,
    updateNote,
    removeCustomBusiness,
    customCount,
  };
}

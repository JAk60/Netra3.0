/**
 * hooks/useShips.ts
 * -----------------
 * Fetches the live fleet list once and caches it at the module level
 * so it survives re-renders and component remounts without refetching.
 *
 * Automatically refreshes every 1 hour in case new ships are added
 * to the DB while the app is open.
 *
 * Usage:
 *   const ships = useShips();
 */

import { useEffect, useState } from 'react';
import { getShips, Ship } from '../actions/shipActions';

// Module-level cache — shared across all hook instances, survives re-renders.
// Null means "not fetched yet". Empty array means "fetched, no ships found".
let _cache: Ship[] | null = null;
let _lastFetchedAt: number = 0;

const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

async function fetchShips(): Promise<Ship[]> {
    const res = await getShips();
    if (res.success && res.data) {
        _cache = res.data;
        _lastFetchedAt = Date.now();
        return res.data;
    }
    // On failure, keep stale cache if available — don't wipe it
    return _cache ?? [];
}

export function useShips(): Ship[] {
    const [ships, setShips] = useState<Ship[]>(_cache ?? []);

    useEffect(() => {
        const now = Date.now();
        const cacheIsStale =
            _cache === null || now - _lastFetchedAt >= REFRESH_INTERVAL_MS;

        if (!cacheIsStale) {
            // Cache is fresh — sync state if needed and do nothing else
            if (ships !== _cache) setShips(_cache!);
            return;
        }

        // Fetch fresh data
        fetchShips().then(data => setShips(data));

        // Set up hourly refresh interval
        const interval = setInterval(() => {
            fetchShips().then(data => setShips(data));
        }, REFRESH_INTERVAL_MS);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return ships;
}
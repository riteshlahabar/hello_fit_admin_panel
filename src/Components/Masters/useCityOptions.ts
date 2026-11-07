// Loads the active cities (and optionally branches) once, for the parent
// selects on the area, branch and holiday screens. A master list is small
// enough that paging the dropdown would be worse than fetching it whole; the
// limit is the API's maximum.

import { useEffect, useState } from 'react';
import { mastersApi } from '../../Services/masters.api';

export interface Option {
  value: string;
  label: string;
}

export function useCityOptions() {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await mastersApi.cities.list({ limit: 100 });
      if (!cancelled && result.ok) {
        setOptions(
          result.value.rows.map((c) => ({
            value: c.id,
            label: c.state ? `${c.name}, ${c.state}` : c.name,
          })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}

export function useAreaOptions(cityId?: string) {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await mastersApi.areas.list({
        limit: 100,
        ...(cityId ? { cityId } : {}),
      });
      if (!cancelled && result.ok) {
        setOptions(
          result.value.rows.map((a) => ({
            value: a.id,
            label: a.city ? `${a.name} — ${a.city.name}` : a.name,
          })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cityId]);

  return options;
}

export function useBranchOptions(cityId?: string) {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await mastersApi.branches.list({
        limit: 100,
        ...(cityId ? { cityId } : {}),
      });
      if (!cancelled && result.ok) {
        setOptions(
          result.value.rows.map((b) => ({ value: b.id, label: b.name })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cityId]);

  return options;
}

// Loads the role list once, for the admin-user form's select and the role
// filter. Same shape as `useCityOptions` — the role list is six rows plus
// whatever ops adds, so paging the dropdown would be worse than fetching it
// whole.

import { useEffect, useState } from 'react';
import { rolesApi } from '../../Services/admins.api';
import type { Option } from '../Masters/useCityOptions';

export function useRoleOptions() {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await rolesApi.list();
      if (!cancelled && result.ok) {
        setOptions(
          result.value.rows.map((r) => ({ value: r.id, label: r.name })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}

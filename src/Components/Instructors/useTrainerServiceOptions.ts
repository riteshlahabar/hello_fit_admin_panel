// The Services options for the trainer Edit dialog — client, 20-11-2026:
// "give option to select service, show service according to category which is
// already selected at the time of registration".
//
// The whole active catalogue is loaded once (it is capped at 100 rows, like
// every other options hook here) and narrowed per row, because the narrowing
// depends on which provider is being edited and the dialog may be opened on
// any row of the page.
//
// **The join is by category name, not id.** A provider's registration
// categories live in `specialisations`, a `String[]` the trainer app fills
// from the `ServiceCategory` master by name (page 15 of the wizard). Matching
// is therefore case- and space-insensitive — a renamed category is the one
// thing that can break the link, and an unmatched provider falls through to
// the full list rather than to an empty select.

import { useEffect, useState } from 'react';
import { fetchServiceOptions } from '../../Services/catalog.api';
import type { FieldOption } from '../Common/CrudPage';

interface ServiceOption extends FieldOption {
  categoryName: string;
}

export function useTrainerServiceOptions() {
  const [services, setServices] = useState<ServiceOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const rows = await fetchServiceOptions();
      if (!cancelled) {
        setServices(
          rows.map((s) => ({
            value: s.value,
            label: s.categoryName ? `${s.label} — ${s.categoryName}` : s.label,
            categoryName: s.categoryName,
          })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * What one provider may be given. A provider who picked no specialisation,
   * or whose categories have since been renamed, sees the full catalogue:
   * an empty select would read as "the catalogue is empty" and leave ops with
   * no way to publish them at all.
   */
  const forTrainer = (specialisations: string[] | undefined): FieldOption[] => {
    const wanted = new Set(
      (specialisations ?? []).map((s) => s.trim().toLowerCase()),
    );
    if (wanted.size === 0) return services;

    const narrowed = services.filter((s) =>
      wanted.has(s.categoryName.trim().toLowerCase()),
    );
    return narrowed.length > 0 ? narrowed : services;
  };

  return forTrainer;
}

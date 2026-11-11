// One loader for all four PDF 6.12 reports, so each report component is its
// table and nothing else.
//
// `fetcher` is wrapped in `useCallback` by the caller (it closes over the
// range), and is this hook's only dependency — so changing From or To
// reloads, and a re-render on its own does not.

import { useEffect, useState } from 'react';
import type { ApiResult } from '../../Services/api';

export interface ReportState<T> {
  data: T | null;
  loading: boolean;
  error?: string;
}

export function useReport<T>(
  fetcher: () => Promise<ApiResult<T>>,
): ReportState<T> {
  const [state, setState] = useState<ReportState<T>>({
    data: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    // Keeps the previous table on screen while the new range loads, rather
    // than flashing an empty one.
    setState((s) => ({ ...s, loading: true, error: undefined }));

    void (async () => {
      const result = await fetcher();
      if (cancelled) return;

      setState(
        result.ok
          ? { data: result.data, loading: false }
          : { data: null, loading: false, error: result.error.message },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [fetcher]);

  return state;
}

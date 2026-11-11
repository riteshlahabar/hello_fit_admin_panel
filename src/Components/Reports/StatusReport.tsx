// 6.12's "relevant booking status totals" — sessions scheduled in the range,
// by status.
//
// All thirteen statuses, nothing rolled up. The Dashboard (6.2) merges the
// three cancellations and two no-shows into two tiles because a tile is a
// glance; here "who cancelled" is the question being asked, so the three stay
// apart.

import { useCallback } from 'react';
import ReportTable from './ReportTable';
import { useReport } from './useReport';
import {
  humanStatus,
  reportsApi,
  type RangeQuery,
} from '../../Services/reports.api';

const StatusReport = ({ range }: { range: RangeQuery }) => {
  const fetcher = useCallback(() => reportsApi.bookingStatus(range), [range]);
  const { data, loading, error } = useReport(fetcher);

  return (
    <ReportTable
      title='Booking status totals'
      subtitle={
        data
          ? `Sessions scheduled ${data.range.from} to ${data.range.to} · ${data.total} in total`
          : undefined
      }
      headers={['Status', 'Sessions', 'Share']}
      loading={loading}
      error={error}
      footer={
        data ? (
          <tr>
            <th scope='row'>Total</th>
            <th>{data.total}</th>
            <th>{data.total === 0 ? '—' : '100%'}</th>
          </tr>
        ) : null
      }>
      {(data?.rows ?? []).map((row) => (
        <tr key={row.status} className={row.sessions === 0 ? 'f-light' : undefined}>
          <td>{humanStatus(row.status)}</td>
          <td>{row.sessions}</td>
          <td>{row.percent}%</td>
        </tr>
      ))}
    </ReportTable>
  );
};

export default StatusReport;

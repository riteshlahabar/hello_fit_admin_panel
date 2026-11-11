// 6.12's "booking summaries" — one row per calendar day, with range totals in
// the footer.
//
// Quiet days are **zero rows, not missing rows**: the API fills the whole
// range, because a gap in a report reads as missing data.

import { useCallback } from 'react';
import ReportTable from './ReportTable';
import { useReport } from './useReport';
import { reportsApi, rupees, type RangeQuery } from '../../Services/reports.api';

const BookingsReport = ({ range }: { range: RangeQuery }) => {
  const fetcher = useCallback(() => reportsApi.bookings(range), [range]);
  const { data, loading, error } = useReport(fetcher);

  return (
    <ReportTable
      title='Bookings'
      subtitle={
        data ? `${data.range.from} to ${data.range.to} · ${data.range.days} days` : undefined
      }
      headers={['Date', 'Bookings', 'Sessions', 'Gross', 'Discount', 'Net']}
      loading={loading}
      error={error}
      footer={
        data ? (
          <tr>
            <th scope='row'>Total</th>
            <th>{data.totals.bookings}</th>
            <th>{data.totals.sessions}</th>
            <th>{rupees(data.totals.gross)}</th>
            <th>{rupees(data.totals.discount)}</th>
            <th>{rupees(data.totals.net)}</th>
          </tr>
        ) : null
      }>
      {(data?.rows ?? []).map((row) => (
        // A zero day is dimmed rather than hidden — present, but not noise.
        <tr key={row.date} className={row.bookings === 0 ? 'f-light' : undefined}>
          <td>{row.date}</td>
          <td>{row.bookings}</td>
          <td>{row.sessions}</td>
          <td>{rupees(row.gross)}</td>
          <td>{rupees(row.discount)}</td>
          <td>{rupees(row.net)}</td>
        </tr>
      ))}
    </ReportTable>
  );
};

export default BookingsReport;

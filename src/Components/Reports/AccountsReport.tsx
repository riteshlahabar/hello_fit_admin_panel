// 6.12's "customer and provider summaries" — a metric/value table.
//
// Two kinds of figure sit side by side on purpose, and the column headers say
// which is which: the platform total (what the marketplace holds now, which
// the range does not touch) and the new-in-range count (which it does).

import { useCallback } from 'react';
import ReportTable from './ReportTable';
import { useReport } from './useReport';
import { reportsApi, type RangeQuery } from '../../Services/reports.api';

const AccountsReport = ({ range }: { range: RangeQuery }) => {
  const fetcher = useCallback(() => reportsApi.accounts(range), [range]);
  const { data, loading, error } = useReport(fetcher);

  const rows: { label: string; value: number; inRange?: number }[] = data
    ? [
        {
          label: 'Customers',
          value: data.customers.total,
          inRange: data.customers.newInRange,
        },
        { label: '— active', value: data.customers.active },
        { label: '— suspended', value: data.customers.suspended },
        { label: '— blocked', value: data.customers.blocked },
        {
          label: 'Providers',
          value: data.providers.total,
          inRange: data.providers.newApplicationsInRange,
        },
        {
          label: '— active',
          value: data.providers.active,
          inRange: data.providers.newApprovedInRange,
        },
        { label: '— applications pending', value: data.providers.pendingApplications },
        { label: '— KYC pending', value: data.providers.kycPending },
      ]
    : [];

  return (
    <ReportTable
      title='Customers and providers'
      subtitle={data ? `New accounts counted ${data.range.from} to ${data.range.to}` : undefined}
      headers={['Metric', 'Total now', 'New in range']}
      loading={loading}
      error={error}>
      {rows.map((row) => (
        <tr key={row.label}>
          <td>{row.label}</td>
          <td>{row.value}</td>
          <td>{row.inRange === undefined ? '—' : row.inRange}</td>
        </tr>
      ))}
    </ReportTable>
  );
};

export default AccountsReport;

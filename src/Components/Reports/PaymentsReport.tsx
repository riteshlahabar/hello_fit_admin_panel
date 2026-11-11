// 6.12's "payment summaries where data is available" — gateway transactions
// raised in the range, by state.
//
// Refunds are a separate line below the total, not a row inside it: they live
// in their own table, and putting them in the body would double-count the
// money against the captured row.

import { useCallback } from 'react';
import ReportTable from './ReportTable';
import { useReport } from './useReport';
import StatusBadge from '../Common/StatusBadge';
import type { BadgeTone } from '../Common/StatusBadge';
import {
  humanStatus,
  reportsApi,
  rupees,
  type RangeQuery,
} from '../../Services/reports.api';

/** Only CAPTURED is money in the bank; FAILED and REFUNDED are not. */
const TONE: Record<string, BadgeTone> = {
  CAPTURED: 'light-success',
  AUTHORIZED: 'light-info',
  PENDING: 'light-warning',
  FAILED: 'light-danger',
  REFUNDED: 'light-secondary',
};

const PaymentsReport = ({ range }: { range: RangeQuery }) => {
  const fetcher = useCallback(() => reportsApi.payments(range), [range]);
  const { data, loading, error } = useReport(fetcher);

  return (
    <ReportTable
      title='Payments'
      subtitle={data ? `${data.range.from} to ${data.range.to}` : undefined}
      headers={['Gateway state', 'Transactions', 'Amount']}
      loading={loading}
      error={error}
      footer={
        data ? (
          <>
            <tr>
              <th scope='row'>Total</th>
              <th>{data.totals.count}</th>
              <th>{rupees(data.totals.amount)}</th>
            </tr>
            <tr>
              <td>Refunds issued</td>
              <td>{data.refunds.count}</td>
              <td>{rupees(data.refunds.amount)}</td>
            </tr>
          </>
        ) : null
      }>
      {(data?.rows ?? []).length === 0 ? (
        <tr>
          <td colSpan={3}>No gateway transactions in this range.</td>
        </tr>
      ) : (
        (data?.rows ?? []).map((row) => (
          <tr key={row.status}>
            <td>
              <StatusBadge tone={TONE[row.status] ?? 'light-secondary'}>
                {humanStatus(row.status)}
              </StatusBadge>
            </td>
            <td>{row.count}</td>
            <td>{rupees(row.amount)}</td>
          </tr>
        ))
      )}
    </ReportTable>
  );
};

export default PaymentsReport;

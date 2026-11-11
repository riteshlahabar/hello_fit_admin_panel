// The shared frame for every PDF 6.12 report: Cuba's card plus the **same
// table format as Customers and Bookings** — `hf-crud-table`, so the 30px edge
// gutter, the equal fixed column widths, the beige header bar and the
// start-aligned first column are identical. Client instruction, 11 Nov 2026,
// after the reports' cells sat 12px in against the card header's 30px.
//
// Not `CrudPage` itself — there is nothing to create, edit or delete here, and
// a CrudPage with every action switched off would still carry its search box,
// paging and Actions column. Same look, none of the machinery.

import type { ReactNode } from 'react';
import { Card, CardHeader, Table } from 'reactstrap';
import { H5 } from '../../AbstractElements';

export interface ReportTableProps {
  title: string;
  /** Shown under the title — usually the range the API echoed back. */
  subtitle?: string;
  headers: string[];
  loading: boolean;
  error?: string;
  /** Rendered as `<tr>`s. Empty is a real answer, not an error. */
  children: ReactNode;
  /** `<tfoot>` content — the range totals, where a report has them. */
  footer?: ReactNode;
}

const ReportTable = ({
  title,
  subtitle,
  headers,
  loading,
  error,
  children,
  footer,
}: ReportTableProps) => (
  <Card>
    <CardHeader>
      <H5>{title}</H5>
      {subtitle ? <span className='f-light f-12'>{subtitle}</span> : null}
    </CardHeader>

    <div className='table-responsive'>
      <Table hover={true} className='table-border-horizontal hf-crud-table'>
        <thead>
          <tr>
            {headers.map((header) => (
              <th scope='col' key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length}>Loading…</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={headers.length} className='txt-danger'>
                {error}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
        {footer && !loading && !error ? <tfoot>{footer}</tfoot> : null}
      </Table>
    </div>
  </Card>
);

export default ReportTable;

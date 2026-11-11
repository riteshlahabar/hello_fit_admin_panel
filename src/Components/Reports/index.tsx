// Reports (PDF 6.12) — /admin/reports/* on the API.
//
// Four reports, each its own route and its own sidebar item under Reports
// (client instruction, 11 Nov 2026 — it replaced one screen with a report
// dropdown). They share `ReportPage` for the From/To range and `ReportTable`
// for the table, which is the **same format as Customers and Bookings**.
//
// All read-only: 6.12 asks to *view* summaries, and **there is no export
// button** — it grants export "only where explicitly included in the agreed
// report requirements" and none are agreed, so the backend has no route.
//
// There is deliberately **no Summary page**. "All reports in cards and
// graphs" is the Dashboard (6.2) with a range instead of a day, and charts
// appear nowhere in the PDF — parked for the client, 11 Nov 2026.

import ReportPage from './ReportPage';
import AccountsReport from './AccountsReport';
import BookingsReport from './BookingsReport';
import PaymentsReport from './PaymentsReport';
import StatusReport from './StatusReport';

export const BookingsReportPage = () => (
  <ReportPage title='Bookings' render={(range) => <BookingsReport range={range} />} />
);

export const AccountsReportPage = () => (
  <ReportPage
    title='Customers and Providers'
    render={(range) => <AccountsReport range={range} />}
  />
);

export const PaymentsReportPage = () => (
  <ReportPage title='Payments' render={(range) => <PaymentsReport range={range} />} />
);

export const StatusReportPage = () => (
  <ReportPage
    title='Booking Status'
    render={(range) => <StatusReport range={range} />}
  />
);

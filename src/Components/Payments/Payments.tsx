// Payment and transaction management (PDF 6.7) — /admin/payments on the API.
//
// On Cuba's HoverableRows table and ModalTag dialog (../Common/CrudPage).
//
// **Read-only.** 6.7's seven functionalities are all views, and it ends by
// saying refund initiation "will depend on the selected payment gateway and
// the agreed refund workflow". So: no Add, no Edit, no Delete, no refund
// button — the single row action is View. Refunds are *shown* (6.7 asks for
// "refund-related status where supported"), never started from here.
//
// The search box spans four things an operator might be holding: the booking
// code, the customer (name or mobile), the provider's name, and either gateway
// reference — client instruction, 10 Nov 2026.
//
// The Instructor column reads the booking's **first session**, not the
// booking: the customer may request a provider at booking time
// (`CreateBookingDto.instructorId`) or leave it to assignment, and either way
// the session is what carries the answer. Before payment is confirmed there is
// usually no provider yet, which is why "Unassigned" is common on this screen
// and is not a fault.

import { Fragment, useCallback, useState } from 'react';
import { Button, Modal, ModalBody, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { BadgeTone } from '../Common/StatusBadge';
import type { ColumnDef } from '../Common/CrudPage';
import {
  PAYMENT_STATES,
  paymentsApi,
  type PaymentRow,
  type PaymentState,
  type RefundRow,
} from '../../Services/payments.api';

const STATE_TONE: Record<PaymentState, BadgeTone> = {
  CREATED: 'light-secondary',
  AUTHORIZED: 'light-info',
  CAPTURED: 'light-success',
  FAILED: 'light-danger',
  REFUNDED: 'light-warning',
};

const labelOf = (state: PaymentState) =>
  PAYMENT_STATES.find((s) => s.value === state)?.label ?? state;

const providerOf = (r: PaymentRow) =>
  r.booking?.sessions?.[0]?.instructor?.name ?? 'Unassigned';

const columns: ColumnDef<PaymentRow>[] = [
  { header: 'Booking', cell: (r) => r.booking?.code ?? '—' },
  {
    header: 'Customer',
    cell: (r) => (
      <div>
        <div>{r.booking?.customer?.name || '—'}</div>
        <span className='f-light f-12'>
          {r.booking?.customer?.user?.mobile ?? ''}
        </span>
      </div>
    ),
  },
  { header: 'Trainer', cell: (r) => providerOf(r) },
  { header: 'Amount', cell: (r) => `₹${Number(r.amount).toFixed(2)}` },
  { header: 'Method', cell: (r) => r.method ?? '—' },
  {
    header: 'Gateway ref',
    cell: (r) => (
      <div>
        <div>{r.gatewayPaymentId ?? '—'}</div>
        {r.gatewayOrderId ? (
          <span className='f-light f-12'>{r.gatewayOrderId}</span>
        ) : null}
      </div>
    ),
  },
  {
    header: 'Status',
    cell: (r) => (
      <div>
        <StatusBadge tone={STATE_TONE[r.status]}>
          {labelOf(r.status)}
        </StatusBadge>
        {/* 6.7: "failed and pending transactions are distinguishable". */}
        {r.failureReason ? (
          <div className='f-light f-12'>{r.failureReason}</div>
        ) : null}
      </div>
    ),
  },
  {
    header: 'Date',
    cell: (r) =>
      new Date(r.paidAt ?? r.createdAt).toLocaleDateString(),
  },
];

interface DetailShape {
  invoice?: {
    invoiceNo: string;
    taxableValue: string;
    total: string;
    issuedAt: string;
  } | null;
  refunds?: RefundRow[];
  booking?: { service?: { name: string } | null };
}

/** `GET :id` — payment, invoice and refunds. Reads on the opening click. */
const ViewModal = ({ payment }: { payment: PaymentRow }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<DetailShape | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    const result = await paymentsApi.get(payment.id);
    setLoading(false);
    if (result.ok) setData(result.data as DetailShape);
    else toast.error(result.error.message);
  };

  const refunds = data?.refunds ?? [];

  return (
    <Fragment>
      <Btn attrBtn={{ color: 'light', size: 'sm', onClick: () => void toggle() }}>
        View
      </Btn>
      <Modal
        className='fade show'
        size='lg'
        isOpen={open}
        toggle={() => void toggle()}>
        <div className='modal-header'>
          <H5
            attrH5={{ className: 'modal-title' }}>{`Transaction — ${payment.booking?.code ?? ''}`}</H5>
          <Button
            color='transparent'
            className='btn-close float-end'
            onClick={() => void toggle()}
            type='button'
            aria-label='Close'
          />
        </div>
        <ModalBody>
          {loading ? (
            <p className='mb-0'>Loading…</p>
          ) : (
            <Fragment>
              <table className='table'>
                <tbody>
                  <tr>
                    <th scope='row'>Customer</th>
                    <td>{payment.booking?.customer?.name ?? '—'}</td>
                  </tr>
                  <tr>
                    <th scope='row'>Trainer</th>
                    <td>{providerOf(payment)}</td>
                  </tr>
                  <tr>
                    <th scope='row'>Service</th>
                    <td>{data?.booking?.service?.name ?? '—'}</td>
                  </tr>
                  <tr>
                    <th scope='row'>Amount</th>
                    <td>{`₹${Number(payment.amount).toFixed(2)}`}</td>
                  </tr>
                  <tr>
                    <th scope='row'>Status</th>
                    <td>{labelOf(payment.status)}</td>
                  </tr>
                  <tr>
                    <th scope='row'>Gateway</th>
                    <td>{payment.gateway}</td>
                  </tr>
                  <tr>
                    <th scope='row'>Order id</th>
                    <td>{payment.gatewayOrderId ?? '—'}</td>
                  </tr>
                  <tr>
                    <th scope='row'>Payment id</th>
                    <td>{payment.gatewayPaymentId ?? '—'}</td>
                  </tr>
                  {payment.failureReason ? (
                    <tr>
                      <th scope='row'>Failure</th>
                      <td>{payment.failureReason}</td>
                    </tr>
                  ) : null}
                  {data?.invoice ? (
                    <tr>
                      <th scope='row'>Invoice</th>
                      <td>
                        {`${data.invoice.invoiceNo} · ₹${Number(data.invoice.total).toFixed(2)}`}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>

              {/* 6.7: "view refund-related status where supported". Shown
                  only — refund initiation belongs to the gateway workflow. */}
              {refunds.length > 0 ? (
                <table className='table'>
                  <thead>
                    <tr>
                      <th scope='col'>Refund</th>
                      <th scope='col'>Amount</th>
                      <th scope='col'>Mode</th>
                      <th scope='col'>Status</th>
                      <th scope='col'>Processed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.map((r) => (
                      <tr key={r.id}>
                        <td>{r.gatewayRefundId ?? r.slabApplied ?? '—'}</td>
                        <td>{`₹${Number(r.amount).toFixed(2)}`}</td>
                        <td>{r.mode}</td>
                        <td>{r.status}</td>
                        <td>
                          {r.processedAt
                            ? new Date(r.processedAt).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </Fragment>
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

const Payments = () => {
  const [status, setStatus] = useState('');

  const load = useCallback(
    (query: { q?: string; page?: number }) =>
      paymentsApi.list({
        q: query.q,
        page: query.page,
        ...(status ? { status: status as PaymentState } : {}),
      }),
    [status],
  );

  return (
    <CrudPage<PaymentRow>
      title='Transactions'
      singular='Transaction'
      parent='Management'
      columns={columns}
      fields={[]}
      load={load}
      canCreate={false}
      hasActiveFlag={false}
      actionsWidth='120px'
      rowActions={(row) => <ViewModal payment={row} />}
      toolbar={
        <Input
          type='select'
          bsSize='sm'
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className='hf-filter-control'
          aria-label='Filter by status'>
          <option value=''>Any status</option>
          {PAYMENT_STATES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Input>
      }
    />
  );
};

export default Payments;

// Booking management (PDF 6.6) — /admin/bookings on the API.
//
// On Cuba's HoverableRows table and ModalTag dialog, the same shape the other
// Management screens use (../Common/CrudPage).
//
// No Add and no Edit dialog: a booking is created by the customer, and 6.6
// gives the administrator "permitted administrative status actions", not a
// form over the booking's fields. The two row actions are **View** (the
// support file — sessions, payments and the status history 6.6 asks for) and
// **Cancel**.
//
// **Cancelling does not refund.** It cancels every session not already
// finished and writes the reason to `booking_status_history`. A refund is its
// own module with its own policy slabs and audit; issuing one silently from a
// table action would hide money movement from finance.
//
// One Status dropdown carries both groups — client instruction, 10 Nov 2026.
// Values are prefixed `s:` / `p:` so one select can drive two different query
// parameters. The Payment column is separate and unchanged.

import { Fragment, useCallback, useState } from 'react';
import { Button, Form, Input, Label, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { BadgeTone } from '../Common/StatusBadge';
import type { ColumnDef } from '../Common/CrudPage';
import {
  bookingsApi,
  formatMinute,
  PAYMENT_OPTIONS,
  STATUS_OPTIONS,
  type Booking,
  type PaymentStatus,
  type SessionStatus,
} from '../../Services/bookings.api';

const STATUS_TONE: Record<SessionStatus, BadgeTone> = {
  PENDING_PAYMENT: 'light-warning',
  CONFIRMED: 'light-info',
  ASSIGNED: 'light-info',
  REASSIGNMENT_NEEDED: 'light-warning',
  EN_ROUTE: 'light-primary',
  IN_PROGRESS: 'light-primary',
  COMPLETED: 'light-success',
  RESCHEDULE_REQUESTED: 'light-warning',
  CANCELLED_BY_CUSTOMER: 'light-danger',
  CANCELLED_BY_TEACHER: 'light-danger',
  CANCELLED_BY_ADMIN: 'light-danger',
  NO_SHOW_CUSTOMER: 'light-danger',
  NO_SHOW_TEACHER: 'light-danger',
};

const PAYMENT_TONE: Record<PaymentStatus, BadgeTone> = {
  UNPAID: 'light-secondary',
  PENDING: 'light-warning',
  PAID: 'light-success',
  PARTIALLY_REFUNDED: 'light-info',
  REFUNDED: 'light-info',
  FAILED: 'light-danger',
};

const labelOf = (value: string, from: { value: string; label: string }[]) =>
  from.find((o) => o.value === value)?.label ?? value;

/**
 * A package booking has many sessions. The row shows the first, and says how
 * many more there are rather than growing to fit them — the detail dialog is
 * where the full list belongs.
 */
const firstSession = (b: Booking) => b.sessions?.[0];

const columns: ColumnDef<Booking>[] = [
  { header: 'Code', cell: (r) => r.code },
  {
    header: 'Customer',
    cell: (r) => (
      <div>
        <div>{r.customer?.name || '—'}</div>
        <span className='f-light f-12'>{r.customer?.user?.mobile ?? ''}</span>
      </div>
    ),
  },
  {
    header: 'Provider',
    cell: (r) => firstSession(r)?.instructor?.name ?? 'Unassigned',
  },
  { header: 'Service', cell: (r) => r.service?.name ?? '—' },
  {
    header: 'Date & time',
    cell: (r) => {
      const s = firstSession(r);
      if (!s) return '—';
      const extra = r.sessions.length - 1;
      return (
        <div>
          <div>{new Date(s.sessionDate).toLocaleDateString()}</div>
          <span className='f-light f-12'>
            {`${formatMinute(s.fromMinute)} – ${formatMinute(s.toMinute)}`}
            {extra > 0 ? ` +${extra} more` : ''}
          </span>
        </div>
      );
    },
  },
  {
    header: 'Status',
    cell: (r) => {
      const s = firstSession(r);
      return s ? (
        <StatusBadge tone={STATUS_TONE[s.status]}>
          {labelOf(s.status, STATUS_OPTIONS)}
        </StatusBadge>
      ) : (
        '—'
      );
    },
  },
  {
    header: 'Payment',
    cell: (r) => (
      <div>
        <StatusBadge tone={PAYMENT_TONE[r.paymentStatus]}>
          {labelOf(r.paymentStatus, PAYMENT_OPTIONS)}
        </StatusBadge>
        <div className='f-light f-12'>{`₹${Number(r.payable).toFixed(2)}`}</div>
      </div>
    ),
  },
];

/** `GET :id` — the support file. Reads on the click that opens it. */
const ViewModal = ({ booking }: { booking: Booking }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    const result = await bookingsApi.get(booking.id);
    setLoading(false);
    if (result.ok) setData(result.data);
    else toast.error(result.error.message);
  };

  const sessions = (data?.sessions ?? []) as BookingSessionDetail[];
  const history = (data?.statusHistory ?? []) as StatusHistoryRow[];

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
          <H5 attrH5={{ className: 'modal-title' }}>{`Booking ${booking.code}`}</H5>
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
                <thead>
                  <tr>
                    <th scope='col'>#</th>
                    <th scope='col'>Date</th>
                    <th scope='col'>Time</th>
                    <th scope='col'>Provider</th>
                    <th scope='col'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td>{s.sequence}</td>
                      <td>{new Date(s.sessionDate).toLocaleDateString()}</td>
                      <td>
                        {`${formatMinute(s.fromMinute)} – ${formatMinute(s.toMinute)}`}
                      </td>
                      <td>{s.instructor?.name ?? 'Unassigned'}</td>
                      <td>{labelOf(s.status, STATUS_OPTIONS)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 6.6 asks for the acceptance, rejection and cancellation
                  record — this is it, straight from booking_status_history. */}
              <table className='table'>
                <thead>
                  <tr>
                    <th scope='col'>When</th>
                    <th scope='col'>Change</th>
                    <th scope='col'>By</th>
                    <th scope='col'>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No recorded changes.</td>
                    </tr>
                  ) : (
                    history.map((h) => (
                      <tr key={h.id}>
                        <td>{new Date(h.createdAt).toLocaleString()}</td>
                        <td>
                          {`${h.fromStatus ? labelOf(h.fromStatus, STATUS_OPTIONS) : '—'} → ${labelOf(h.toStatus, STATUS_OPTIONS)}`}
                        </td>
                        <td>{h.actorType}</td>
                        <td>{h.reason ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Fragment>
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

interface BookingSessionDetail {
  id: string;
  sequence: number;
  sessionDate: string;
  fromMinute: number;
  toMinute: number;
  status: SessionStatus;
  instructor: { name: string } | null;
}

interface StatusHistoryRow {
  id: string;
  fromStatus: SessionStatus | null;
  toStatus: SessionStatus;
  actorType: string;
  reason: string | null;
  createdAt: string;
}

/** `POST :id/cancel`. Reason mandatory; no refund is issued. */
const CancelModal = ({
  booking,
  onDone,
}: {
  booking: Booking;
  onDone: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = () => {
    setReason('');
    setOpen((v) => !v);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = await bookingsApi.cancel(booking.id, reason.trim());
    setSaving(false);

    if (result.ok) {
      // The message carries the session count the API actually cancelled, and
      // says the refund is separate.
      toast.success(result.message ?? 'Cancelled');
      setOpen(false);
      onDone();
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <Fragment>
      <Btn
        attrBtn={{ color: 'danger', size: 'sm', outline: true, onClick: toggle }}>
        Cancel
      </Btn>
      <Modal className='fade show' isOpen={open} toggle={toggle}>
        <div className='modal-header'>
          <H5
            attrH5={{ className: 'modal-title' }}>{`Cancel ${booking.code}`}</H5>
          <Button
            color='transparent'
            className='btn-close float-end'
            onClick={toggle}
            type='button'
            aria-label='Close'
          />
        </div>
        <ModalBody>
          <Form className='needs-validation' onSubmit={submit}>
            <div className='mb-3'>
              <Label for='cancelReason'>Reason *</Label>
              <Input
                type='textarea'
                id='cancelReason'
                rows={3}
                required
                minLength={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Btn attrBtn={{ color: 'primary', type: 'submit', disabled: saving }}>
              {saving ? 'Cancelling…' : 'Cancel booking'}
            </Btn>
            <Btn
              attrBtn={{
                color: 'secondary',
                className: 'm-l-5',
                type: 'button',
                onClick: toggle,
              }}>
              Close
            </Btn>
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

const Bookings = () => {
  // One select, two query parameters. `s:` → status, `p:` → paymentStatus.
  const [filter, setFilter] = useState('');

  const load = useCallback(
    (query: { q?: string; page?: number }) =>
      bookingsApi.list({
        q: query.q,
        page: query.page,
        ...(filter.startsWith('s:')
          ? { status: filter.slice(2) as SessionStatus }
          : {}),
        ...(filter.startsWith('p:')
          ? { paymentStatus: filter.slice(2) as PaymentStatus }
          : {}),
      }),
    [filter],
  );

  return (
    <CrudPage<Booking>
      title='Bookings'
      singular='Booking'
      parent='Management'
      columns={columns}
      fields={[]}
      load={load}
      canCreate={false}
      hasActiveFlag={false}
      actionsWidth='260px'
      rowActions={(row, refresh) => (
        <Fragment>
          <ViewModal booking={row} />
          <CancelModal booking={row} onDone={refresh} />
        </Fragment>
      )}
      toolbar={
        <Input
          type='select'
          bsSize='sm'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className='hf-filter-control'
          aria-label='Filter by status'>
          <option value=''>Any status</option>
          <optgroup label='Booking status'>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={`s:${o.value}`}>
                {o.label}
              </option>
            ))}
          </optgroup>
          <optgroup label='Payment'>
            {PAYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={`p:${o.value}`}>
                {o.label}
              </option>
            ))}
          </optgroup>
        </Input>
      }
    />
  );
};

export default Bookings;

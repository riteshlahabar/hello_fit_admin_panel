// Customer management (spec 5.3) — /admin/customers on the API.
//
// On Cuba's HoverableRows table and ModalTag dialog, the same shapes the
// masters and Administration screens use (../Common/CrudPage).
//
// No Add button and no delete button, because the API has neither route: a
// customer account is created by OTP signup, and removal is the data-deletion
// request (spec 10.3). What this screen does is find them, correct the
// profile, and suspend the login.
//
// **The blacklist is not on this screen** — client instruction, 10 Nov 2026.
// `POST /admin/customers/:id/block` exists and is tested; nothing in the panel
// calls it, so a blocked customer can only be un-blocked through the API. The
// two are genuinely different: Suspend writes `User.status` and revokes the
// refresh tokens (the app signs out), while block writes
// `CustomerProfile.isBlocked` and only stops the next booking.
//
// `trustScore` and `trustBand` are read-only here on purpose — they are
// derived from teacher-to-customer reviews and behaviour flags (spec 4.6), so
// an edit would be overwritten at the next recompute. The DTO has no such
// field, and the API refuses the request outright.

import { Fragment, useCallback, useState } from 'react';
import { Button, Form, Input, Label, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { BadgeTone } from '../Common/StatusBadge';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import { customersApi, type Customer } from '../../Services/customers.api';
import type { UserStatus } from '../../Services/admins.api';

const STATUS_TONE: Record<UserStatus, BadgeTone> = {
  ACTIVE: 'light-success',
  SUSPENDED: 'light-warning',
  DELETED: 'light-danger',
};

const title = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');

const columns: ColumnDef<Customer>[] = [
  {
    header: 'Name',
    cell: (r) => (
      <div>
        <div>{r.name || '—'}</div>
        <span className='f-light f-12'>{r.referralCode}</span>
      </div>
    ),
  },
  {
    header: 'Mobile',
    cell: (r) => (
      <div>
        <div>{r.user.mobile}</div>
        {r.user.email ? (
          <span className='f-light f-12'>{r.user.email}</span>
        ) : null}
      </div>
    ),
  },
  { header: 'Bookings', cell: (r) => r._count?.bookings ?? 0 },
  {
    header: 'Status',
    cell: (r) => (
      <StatusBadge tone={STATUS_TONE[r.user.status]}>
        {title(r.user.status)}
      </StatusBadge>
    ),
  },
  {
    header: 'Last login',
    cell: (r) =>
      r.user.lastLoginAt
        ? new Date(r.user.lastLoginAt).toLocaleString()
        : 'Never',
  },
];

/** `POST :id/status`. Suspending also revokes their refresh tokens. */
const StatusModal = ({
  customer,
  onDone,
}: {
  customer: Customer;
  onDone: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<UserStatus>(customer.user.status);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = () => {
    setStatus(customer.user.status);
    setReason('');
    setOpen((v) => !v);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = await customersApi.changeStatus(customer.id, {
      status,
      reason: reason.trim(),
    });
    setSaving(false);

    if (result.ok) {
      // The message carries the session and booking counts the API measured.
      toast.success(result.message ?? 'Status updated');
      setOpen(false);
      onDone();
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <Fragment>
      <Btn attrBtn={{ color: 'light', size: 'sm', onClick: toggle }}>
        Status
      </Btn>
      <Modal className='fade show' isOpen={open} toggle={toggle}>
        <div className='modal-header'>
          <H5
            attrH5={{ className: 'modal-title' }}>{`Status — ${customer.name || customer.user.mobile}`}</H5>
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
              <Label for='customerStatus'>Status *</Label>
              <Input
                type='select'
                id='customerStatus'
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}>
                <option value='ACTIVE'>Active</option>
                <option value='SUSPENDED'>Suspended</option>
              </Input>
            </div>
            <div className='mb-3'>
              <Label for='customerStatusReason'>Reason *</Label>
              <Input
                type='textarea'
                id='customerStatusReason'
                rows={3}
                required
                minLength={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Btn attrBtn={{ color: 'primary', type: 'submit', disabled: saving }}>
              {saving ? 'Saving…' : 'Save'}
            </Btn>
            <Btn
              attrBtn={{
                color: 'secondary',
                className: 'm-l-5',
                type: 'button',
                onClick: toggle,
              }}>
              Cancel
            </Btn>
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

/** Ops may correct these five; everything else on the row is read-only. */
const fields: FieldDef<Customer>[] = [
  { name: 'name', label: 'Full name', required: true },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    options: [
      { value: 'FEMALE', label: 'Female' },
      { value: 'MALE', label: 'Male' },
      { value: 'OTHER', label: 'Other' },
      { value: 'UNDISCLOSED', label: 'Undisclosed' },
    ],
  },
  { name: 'dob', label: 'Date of birth', type: 'date' },
  { name: 'goal', label: 'Goal' },
  {
    name: 'healthNotes',
    label: 'Health notes',
    type: 'textarea',
    wide: true,
  },
];

const Customers = () => {
  const [status, setStatus] = useState('');

  // `includeInactive` is CrudPage's name for the switch; this list calls the
  // flag `includeDeleted`, so the mapping happens here.
  //
  // The API also filters on `trustBand` and `isBlocked`. The client asked for
  // neither as a control, so the columns show them and nothing filters on them.
  const load = useCallback(
    (query: { q?: string; page?: number; includeInactive?: boolean }) =>
      customersApi.list({
        q: query.q,
        page: query.page,
        includeDeleted: query.includeInactive,
        ...(status ? { status: status as UserStatus } : {}),
      }),
    [status],
  );

  return (
    <CrudPage<Customer>
      title='Customers'
      singular='Customer'
      parent='Management'
      columns={columns}
      fields={fields}
      load={load}
      update={customersApi.update}
      canCreate={false}
      inactiveLabel='Show removed'
      actionsWidth='225px'
      rowActions={(row, refresh) => (
        <StatusModal customer={row} onDone={refresh} />
      )}
      toolbar={
        <Fragment>
          <Input
            type='select'
            bsSize='sm'
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className='hf-filter-control'
            aria-label='Filter by status'>
            <option value=''>Any status</option>
            <option value='ACTIVE'>Active</option>
            <option value='SUSPENDED'>Suspended</option>
          </Input>
        </Fragment>
      }
    />
  );
};

export default Customers;

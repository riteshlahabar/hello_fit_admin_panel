// Commission and earnings (PDF 6.8) — /admin/earnings on the API.
//
// On Cuba's HoverableRows table and ModalTag dialog (../Common/CrudPage).
//
// One row is one completed session's money: what the booking was worth, what
// the platform took, what was deducted, what the instructor is owed, and which
// payout batch it landed in. That is 6.8's four display requirements.
//
// **This screen never moves money.** 6.8 excludes "automated provider
// settlements, split payments and advanced accounting functionality... unless
// separately agreed". The two actions are Withhold (hold an earning out of
// every future batch) and Release (put it back) — both change eligibility, not
// a balance. Approving and paying a batch is the payout screen's job, and that
// screen does not exist yet.
//
// **Commission parameters are not configurable here.** 6.8 says "configure or
// maintain agreed commission parameters **where included**" — conditional, and
// there is no admin CRUD over `CommissionRule`. The computed commission is
// shown per row; changing the rule that produced it is not offered.

import { Fragment, useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Label, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { BadgeTone } from '../Common/StatusBadge';
import type { ColumnDef } from '../Common/CrudPage';
import {
  EARNING_STATUSES,
  earningsApi,
  type Earning,
  type EarningStatus,
} from '../../Services/earnings.api';
import { instructorsApi } from '../../Services/instructors.api';

const STATUS_TONE: Record<EarningStatus, BadgeTone> = {
  PENDING: 'light-warning',
  PAYABLE: 'light-info',
  PAID: 'light-success',
  WITHHELD: 'light-danger',
};

const money = (value: string) => `₹${Number(value).toFixed(2)}`;

const labelOf = (status: EarningStatus) =>
  EARNING_STATUSES.find((s) => s.value === status)?.label ?? status;

const columns: ColumnDef<Earning>[] = [
  {
    header: 'Booking',
    cell: (r) => (
      <div>
        <div>{r.session?.booking?.code ?? '—'}</div>
        <span className='f-light f-12'>
          {r.session
            ? new Date(r.session.sessionDate).toLocaleDateString()
            : ''}
        </span>
      </div>
    ),
  },
  { header: 'Trainer', cell: (r) => r.instructor?.name ?? '—' },
  { header: 'Service', cell: (r) => r.session?.service?.name ?? '—' },
  { header: 'Session value', cell: (r) => money(r.sessionValue) },
  { header: 'Commission', cell: (r) => money(r.commissionAmount) },
  {
    header: 'Deductions',
    cell: (r) => (Number(r.deductions) > 0 ? money(r.deductions) : '—'),
  },
  { header: 'Net', cell: (r) => money(r.netAmount) },
  {
    header: 'Status',
    cell: (r) => (
      <div>
        <StatusBadge tone={STATUS_TONE[r.status]}>
          {labelOf(r.status)}
        </StatusBadge>
        {r.withheldReason ? (
          <div className='f-light f-12'>{r.withheldReason}</div>
        ) : null}
      </div>
    ),
  },
  {
    header: 'Payout',
    cell: (r) => {
      const payout = r.payoutItem?.payout;
      if (!payout) {
        // PENDING earnings are waiting on the dispute window to close.
        return r.payableFrom
          ? `payable ${new Date(r.payableFrom).toLocaleDateString()}`
          : 'Not batched';
      }
      return (
        <div>
          <div>{payout.status}</div>
          <span className='f-light f-12'>
            {`${new Date(payout.cycleFrom).toLocaleDateString()} – ${new Date(payout.cycleTo).toLocaleDateString()}`}
          </span>
        </div>
      );
    },
  },
];

/**
 * Withhold needs a reason (the API demands 3+ characters); release does not,
 * so releasing is one click rather than a form.
 */
const HoldButton = ({
  earning,
  onDone,
}: {
  earning: Earning;
  onDone: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = () => {
    setReason('');
    setOpen((v) => !v);
  };

  const send = async (action: 'withhold' | 'release', text?: string) => {
    setSaving(true);
    const result =
      action === 'withhold'
        ? await earningsApi.withhold(earning.id, text ?? '')
        : await earningsApi.release(earning.id);
    setSaving(false);

    if (result.ok) {
      toast.success(result.message ?? 'Saved');
      setOpen(false);
      onDone();
    } else {
      toast.error(result.error.message);
    }
  };

  if (earning.status === 'WITHHELD') {
    return (
      <Btn
        attrBtn={{
          color: 'primary',
          size: 'sm',
          disabled: saving,
          onClick: () => void send('release'),
        }}>
        Release
      </Btn>
    );
  }

  // An earning already paid out cannot be held back.
  if (earning.status === 'PAID') return null;

  return (
    <Fragment>
      <Btn
        attrBtn={{
          color: 'warning',
          size: 'sm',
          outline: true,
          onClick: toggle,
        }}>
        Withhold
      </Btn>
      <Modal className='fade show' isOpen={open} toggle={toggle}>
        <div className='modal-header'>
          <H5
            attrH5={{ className: 'modal-title' }}>{`Withhold — ${earning.instructor?.name ?? ''}`}</H5>
          <Button
            color='transparent'
            className='btn-close float-end'
            onClick={toggle}
            type='button'
            aria-label='Close'
          />
        </div>
        <ModalBody>
          <Form
            className='needs-validation'
            onSubmit={(event) => {
              event.preventDefault();
              void send('withhold', reason.trim());
            }}>
            <div className='mb-3'>
              <Label for='withholdReason'>Reason *</Label>
              <Input
                type='textarea'
                id='withholdReason'
                rows={3}
                required
                minLength={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Btn attrBtn={{ color: 'primary', type: 'submit', disabled: saving }}>
              {saving ? 'Saving…' : 'Withhold'}
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

const Earnings = () => {
  const [instructors, setInstructors] = useState<
    { value: string; label: string }[]
  >([]);
  const [instructorId, setInstructorId] = useState('');
  const [status, setStatus] = useState('');

  // The earnings endpoint filters by instructor id, so the names have to come
  // from somewhere; the instructor list is small enough to fetch whole.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await instructorsApi.list({ limit: 100 });
      if (!cancelled && result.ok) {
        setInstructors(
          result.value.rows.map((i) => ({ value: i.id, label: i.name })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // This endpoint has no `q` — it filters by instructor id, not free text.
  const load = useCallback(
    (query: { page?: number }) =>
      earningsApi.list({
        page: query.page,
        ...(instructorId ? { instructorId } : {}),
        ...(status ? { status: status as EarningStatus } : {}),
      }),
    [instructorId, status],
  );

  return (
    <CrudPage<Earning>
      title='Earnings'
      singular='Earning'
      parent='Finance'
      columns={columns}
      fields={[]}
      load={load}
      canCreate={false}
      hasActiveFlag={false}
      hasSearch={false}
      actionsWidth='140px'
      rowActions={(row, refresh) => (
        <HoldButton earning={row} onDone={refresh} />
      )}
      toolbar={
        <Fragment>
          <Input
            type='select'
            bsSize='sm'
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className='hf-filter-control'
            aria-label='Filter by trainer'>
            <option value=''>Any trainer</option>
            {instructors.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </Input>
          <Input
            type='select'
            bsSize='sm'
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className='hf-filter-control'
            aria-label='Filter by status'>
            <option value=''>Any status</option>
            {EARNING_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Input>
        </Fragment>
      }
    />
  );
};

export default Earnings;

// Coupons and promotional settings (PDF 6.9) — /admin/coupons on the API.
//
// On Cuba's HoverableRows table and ModalTag dialog (../Common/CrudPage).
//
// All four of 6.9's functionalities are here and nothing else: create, the
// code and discount parameters, the validity rules, and activate/deactivate.
// There is no per-service, per-city or first-booking restriction — the PDF
// does not ask for one.
//
// Two columns are derived by the API rather than typed: `validity` says why an
// active coupon may still do nothing, and `exhausted` says the usage cap is
// spent. Both are states ops otherwise has to work out from two date columns
// and a counter.

import { useCallback, useState } from 'react';
import { Input } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn } from '../../AbstractElements';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import type { BadgeTone } from '../Common/StatusBadge';
import {
  couponsApi,
  formatDiscount,
  type Coupon,
  type CouponListQuery,
} from '../../Services/coupons.api';

/** Tone for the validity chip: only `valid` is good news. */
const VALIDITY_TONE: Record<Coupon['validity'], BadgeTone> = {
  valid: 'light-success',
  upcoming: 'light-info',
  expired: 'light-secondary',
};

const columns: ColumnDef<Coupon>[] = [
  {
    header: 'Code',
    cell: (r) => (
      <div>
        <div>{r.code}</div>
        {r.description ? (
          <span className='f-light f-12'>{r.description}</span>
        ) : null}
      </div>
    ),
  },
  {
    header: 'Discount',
    cell: (r) => (
      <div>
        <div>{formatDiscount(r)}</div>
        {/* A ceiling only exists on a percentage coupon. */}
        {r.maxDiscount !== null ? (
          <span className='f-light f-12'>max ₹{r.maxDiscount.toFixed(2)}</span>
        ) : null}
      </div>
    ),
  },
  {
    header: 'Validity',
    cell: (r) => (
      <div>
        <div>
          {r.validFrom} → {r.validTo}
        </div>
        <StatusBadge tone={VALIDITY_TONE[r.validity]}>{r.validity}</StatusBadge>
      </div>
    ),
  },
  {
    header: 'Usage',
    cell: (r) => (
      <div>
        <div>
          {r.usedCount} / {r.usageLimit ?? '∞'}
        </div>
        {r.exhausted ? (
          <span className='f-light f-12'>fully redeemed</span>
        ) : r.perCustomerLimit !== null ? (
          <span className='f-light f-12'>{r.perCustomerLimit} per customer</span>
        ) : null}
      </div>
    ),
  },
  {
    header: 'Min booking',
    cell: (r) =>
      r.minBookingAmount > 0 ? `₹${r.minBookingAmount.toFixed(2)}` : '—',
  },
  {
    header: 'Status',
    cell: (r) => (
      <StatusBadge tone={r.isActive ? 'light-success' : 'light-secondary'}>
        {r.isActive ? 'Active' : 'Inactive'}
      </StatusBadge>
    ),
  },
];

const fields: FieldDef<Coupon>[] = [
  {
    name: 'code',
    label: 'Code',
    required: true,
    placeholder: 'DIWALI25',
    help: 'Letters, digits, hyphen and underscore. Stored upper-case. Frozen once the coupon has been redeemed.',
  },
  {
    name: 'discountType',
    label: 'Discount type',
    type: 'select',
    required: true,
    defaultValue: 'PERCENT',
    options: [
      { value: 'PERCENT', label: 'Percentage off' },
      { value: 'FLAT', label: 'Flat amount off' },
    ],
  },
  {
    name: 'discountValue',
    label: 'Discount value',
    type: 'number',
    required: true,
    help: 'Per cent (1–100) for a percentage coupon, rupees for a flat one.',
  },
  {
    name: 'maxDiscount',
    label: 'Maximum discount (₹)',
    type: 'number',
    help: 'Percentage coupons only — the ceiling on what it can take off.',
  },
  {
    name: 'minBookingAmount',
    label: 'Minimum booking (₹)',
    type: 'number',
    defaultValue: 0,
    help: 'The booking must reach this before the code applies.',
  },
  { name: 'validFrom', label: 'Valid from', type: 'date', required: true },
  {
    name: 'validTo',
    label: 'Valid to',
    type: 'date',
    required: true,
    help: 'Both ends are inclusive calendar days.',
  },
  {
    name: 'usageLimit',
    label: 'Total redemptions',
    type: 'number',
    help: 'Leave empty for unlimited.',
  },
  {
    name: 'perCustomerLimit',
    label: 'Redemptions per customer',
    type: 'number',
    help: 'Leave empty for unlimited.',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    wide: true,
  },
];

/** `POST :id/status` — 6.9's activate / deactivate, as its own route. */
const StatusButton = ({
  coupon,
  onDone,
}: {
  coupon: Coupon;
  onDone: () => void;
}) => {
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    setSaving(true);
    const result = await couponsApi.setStatus(coupon.id, !coupon.isActive);
    setSaving(false);

    if (result.ok) {
      toast.success(result.message ?? 'Saved');
      onDone();
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <Btn
      attrBtn={{
        color: coupon.isActive ? 'warning' : 'primary',
        size: 'sm',
        outline: coupon.isActive,
        disabled: saving,
        onClick: () => void toggle(),
      }}>
      {coupon.isActive ? 'Deactivate' : 'Activate'}
    </Btn>
  );
};

const Coupons = () => {
  const [validity, setValidity] =
    useState<NonNullable<CouponListQuery['validity']>>('all');

  const load = useCallback(
    (query: { q?: string; page?: number; includeInactive?: boolean }) =>
      couponsApi.list({
        q: query.q,
        page: query.page,
        // The house default: the table shows the live set, and the switch
        // widens it rather than inverting it.
        status: query.includeInactive ? 'all' : 'active',
        ...(validity === 'all' ? {} : { validity }),
      }),
    [validity],
  );

  return (
    <CrudPage<Coupon>
      title='Coupons'
      singular='Coupon'
      parent='Marketing'
      columns={columns}
      fields={fields}
      load={load}
      create={couponsApi.create}
      update={couponsApi.update}
      remove={couponsApi.remove}
      deleteVerb='Retire'
      inactiveLabel='Show inactive'
      actionsWidth='265px'
      reloadKey={validity}
      rowActions={(row, refresh) => (
        <StatusButton coupon={row} onDone={refresh} />
      )}
      toolbar={
        <Input
          type='select'
          bsSize='sm'
          value={validity}
          onChange={(e) =>
            setValidity(e.target.value as NonNullable<CouponListQuery['validity']>)
          }
          className='hf-filter-control'
          aria-label='Filter by validity'>
          <option value='all'>Any validity</option>
          <option value='valid'>Currently valid</option>
          <option value='upcoming'>Upcoming</option>
          <option value='expired'>Expired</option>
        </Input>
      }
    />
  );
};

export default Coupons;

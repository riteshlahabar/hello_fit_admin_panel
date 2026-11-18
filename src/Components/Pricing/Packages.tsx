// Packages — /admin/packages on the API.
//
// This screen replaces Membership Plans. The client reads "plan" as "package"
// (17 Nov 2026), so the Marketing menu item and its route were renamed rather
// than a second screen added, and `modules/plan/` is gone from the backend.
//
// Shape agreed before building, per the standing rule: columns Name ·
// Sessions · Free · Validity · Percent · Sort · Active; filters `q` and
// "show inactive"; row actions Edit and Activate/Deactivate.
//
// **A package holds a percent, never a price.** The money is the service's
// `basePrice`; the same -15% serves every service in the catalogue. The API
// rejects a `price` in the body, so there is deliberately no such field here.
//
// **Delete is hard (18 Nov) but refused while a booking points at the row** —
// the invoice behind it must stay explicable. Inactive is how a used package
// leaves the dropdown.

import { useCallback } from 'react';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import StatusButton from './StatusButton';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import { pricingApi, type Package } from '../../Services/pricing.api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Signed, and the sign is the whole meaning — +20 costs more, -15 less. */
const percentLabel = (value: number) =>
  `${value > 0 ? '+' : ''}${Number(value)}%`;

const columns: ColumnDef<Package>[] = [
  {
    header: 'Name',
    cell: (r) => (
      <div>
        <div>
          <span className='f-18 me-2'>{r.icon || '◆'}</span>
          {r.name}
        </div>
        <span className='f-light f-12'>
          {r.allowedWeekdays.length
            ? r.allowedWeekdays.map((d) => DAYS[d] ?? d).join(', ')
            : 'any weekday'}
          {r.fixedInstructorAllowed ? '' : ' · no fixed trainer'}
        </span>
      </div>
    ),
  },
  { header: 'Sessions', cell: (r) => r.sessionCount },
  { header: 'Free', cell: (r) => r.freeSessionCount || '—' },
  { header: 'Validity', cell: (r) => `${r.validityDays} days` },
  { header: 'Percent', cell: (r) => percentLabel(r.percentAdjust) },
  { header: 'Bookings', cell: (r) => r._count?.bookings ?? 0 },
  { header: 'Sort', cell: (r) => r.sortOrder },
  {
    header: 'Status',
    cell: (r) => (
      <StatusBadge tone={r.isActive ? 'light-success' : 'light-secondary'}>
        {r.isActive ? 'Active' : 'Inactive'}
      </StatusBadge>
    ),
  },
];

const fields: FieldDef<Package>[] = [
  { name: 'name', label: 'Name', required: true },
  {
    // Decoration on the website card, as Membership Plans carried. Empty
    // clears it and the card falls back to its own mark.
    name: 'icon',
    label: 'Icon / symbol',
    placeholder: '🔥',
    help: 'One emoji or symbol, shown on the package card. Leave empty for the default mark.',
    readValue: (row) => row.icon ?? '',
  },
  {
    name: 'sessionCount',
    label: 'Sessions',
    type: 'number',
    required: true,
    defaultValue: 1,
    help: 'Sessions the customer pays for.',
  },
  {
    name: 'freeSessionCount',
    label: 'Free sessions',
    type: 'number',
    defaultValue: 0,
    help: 'Delivered on top, charged to nobody and paid to nobody — the trial is 1 + 1.',
  },
  {
    name: 'validityDays',
    label: 'Validity (days)',
    type: 'number',
    required: true,
    defaultValue: 30,
  },
  {
    name: 'percentAdjust',
    label: 'Percent adjust',
    type: 'number',
    defaultValue: 0,
    help: 'Signed, applied to rate x sessions. +20 is the trial markup, -15 the intensive discount.',
  },
  {
    name: 'allowedWeekdays',
    label: 'Allowed weekdays',
    placeholder: '1,3,5',
    wide: true,
    help: '0 = Sunday to 6 = Saturday, comma separated. Leave empty for any weekday.',
    readValue: (row) => row.allowedWeekdays.join(','),
  },
  {
    name: 'fixedInstructorAllowed',
    label: 'Fixed trainer allowed',
    type: 'checkbox',
    defaultValue: true,
  },
  { name: 'sortOrder', label: 'Sort order', type: 'number', defaultValue: 0 },
  {
    // Status moves through its own audited route once the row exists, so the
    // checkbox is only offered while creating.
    name: 'isActive',
    label: 'Active',
    type: 'checkbox',
    defaultValue: true,
    createOnly: true,
  },
];

const Packages = () => {
  const load = useCallback(
    (query: { q?: string; page?: number; includeInactive?: boolean }) =>
      pricingApi.packages.list(query),
    [],
  );

  return (
    <CrudPage<Package>
      title='Packages'
      singular='Package'
      parent='Marketing'
      columns={columns}
      fields={fields}
      load={load}
      create={pricingApi.packages.create}
      update={pricingApi.packages.update}
      remove={pricingApi.packages.remove}
      deleteVerb='Delete'
      inactiveLabel='Show inactive'
      actionsWidth='210px'
      rowActions={(row, refresh) => (
        <StatusButton
          isActive={row.isActive}
          setStatus={(isActive) => pricingApi.packages.setStatus(row.id, isActive)}
          onDone={refresh}
        />
      )}
    />
  );
};

export default Packages;

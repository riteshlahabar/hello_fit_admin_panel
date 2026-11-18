// Packages — /admin/packages on the API.
//
// This screen replaces Membership Plans. The client reads "plan" as "package"
// (17 Nov 2026), so the Marketing menu item and its route were renamed rather
// than a second screen added, and `modules/plan/` is gone from the backend.
//
// Shape agreed before building, per the standing rule: columns Name ·
// Services · Sessions · Persons · Free · Validity · Percent · Sort · Active;
// filters `q` and "show inactive"; row actions Edit and Activate/Deactivate.
//
// **A package holds a percent, never a price.** The money is the service's
// `basePrice`: base x persons x sessions, then the percent.
//
// **It names the services it is sold on and carries its own `persons`**
// (client, 18 Nov 2026) — that pair replaced Group Slabs, which is deleted.
// A package with no service ticked is sold nowhere.
//
// **Delete is hard (18 Nov) but refused while a booking points at the row** —
// the invoice behind it must stay explicable. Inactive is how a used package
// leaves the dropdown.

import { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import StatusButton from './StatusButton';
import { packageFields } from './package.fields';
import type { ColumnDef } from '../Common/CrudPage';
import { pricingApi, type Package } from '../../Services/pricing.api';
import { fetchServiceOptions } from '../../Services/catalog.api';

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
  {
    header: 'Services',
    // No service ticked means the customer never sees it, so that reads as a
    // warning rather than a blank cell.
    cell: (r) =>
      r.services?.length ? (
        <span className='f-12'>
          {r.services.map((s) => s.name).join(', ')}
        </span>
      ) : (
        <StatusBadge tone='light-warning'>Sold nowhere</StatusBadge>
      ),
  },
  { header: 'Sessions', cell: (r) => r.sessionCount },
  { header: 'Persons', cell: (r) => r.persons },
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

const Packages = () => {
  const [services, setServices] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const options = await fetchServiceOptions();
      if (!cancelled) setServices(options);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(
    (query: { q?: string; page?: number; includeInactive?: boolean }) =>
      pricingApi.packages.list(query),
    [],
  );

  const fields = useMemo(() => packageFields(services), [services]);

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
          setStatus={(isActive) =>
            pricingApi.packages.setStatus(row.id, isActive)
          }
          onDone={refresh}
        />
      )}
    />
  );
};

export default Packages;

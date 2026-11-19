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
// **Category and Services are both compulsory** (client, 19 Nov 2026), so new
// rows always name a service; the "Sold nowhere" badge below is for rows
// created before that rule.
//
// **Delete is hard (18 Nov) but refused while a booking points at the row** —
// the invoice behind it must stay explicable. Inactive is how a used package
// leaves the dropdown.

import { useCallback, useEffect, useMemo, useState } from 'react';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import StatusButton from './StatusButton';
import { packageFields } from './package.fields';
import type { ServiceOption } from './package.fields';
import type { ColumnDef, FieldOption } from '../Common/CrudPage';
import { pricingApi, type Package } from '../../Services/pricing.api';
import {
  fetchCategoryOptions,
  fetchServiceOptions,
} from '../../Services/catalog.api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Signed, and the sign is the whole meaning — +20 costs more, -15 less. */
const percentLabel = (value: number) =>
  `${value > 0 ? '+' : ''}${Number(value)}%`;

// Column widths, client 18 Nov 2026: Name and Services are the two columns a
// human reads, the other seven are one number each, so equal shares of the
// table (`table-layout: fixed`'s default) spent most of the width on numbers
// and squeezed both of the useful columns into two wrapped lines. These sum to
// 100% with the 72px Actions column outside them, which is what keeps the
// table inside its card instead of under a horizontal scrollbar.
const columns: ColumnDef<Package>[] = [
  {
    header: 'Name',
    width: '20%',
    // Name on its own line — truncated with the full value on hover rather
    // than broken mid-word, which is what `.hf-crud-table` does by default —
    // and the weekdays under it, where they read as a qualifier on the name.
    cell: (r) => (
      <div>
        <div className='hf-cell-oneline' title={r.name}>
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
    width: '22%',
    // One service per line (client, 18 Nov 2026). Comma-joined, four services
    // read as one run-on string and there was no telling where one ended.
    //
    // No service ticked means the customer never sees it, so that reads as a
    // warning rather than a blank cell.
    cell: (r) =>
      r.services?.length ? (
        <div className='hf-cell-lines'>
          {r.services.map((s) => (
            <div className='hf-cell-oneline f-12' key={s.id} title={s.name}>
              {s.name}
            </div>
          ))}
        </div>
      ) : (
        <StatusBadge tone='light-warning'>Sold nowhere</StatusBadge>
      ),
  },
  { header: 'Sessions', width: '8%', cell: (r) => r.sessionCount },
  { header: 'Persons', width: '8%', cell: (r) => r.persons },
  { header: 'Free', width: '7%', cell: (r) => r.freeSessionCount || '—' },
  {
    header: 'Validity',
    width: '10%',
    cell: (r) => `${r.validityDays} days`,
  },
  {
    header: 'Percent',
    width: '7%',
    cell: (r) => percentLabel(r.percentAdjust),
  },
  // Bookings dropped (client, 18 Nov 2026) — the count is not something the
  // administrator manages from this screen, and `_count` is still read by the
  // delete refusal, which is where the number actually matters.
  { header: 'Sort', width: '6%', cell: (r) => r.sortOrder },
  {
    header: 'Status',
    // The widest of the seven narrow columns: its value is a badge, and
    // "Inactive" inside one needs ~100px before the pill starts to clip.
    width: '12%',
    cell: (r) => (
      <StatusBadge tone={r.isActive ? 'light-success' : 'light-secondary'}>
        {r.isActive ? 'Active' : 'Inactive'}
      </StatusBadge>
    ),
  },
];

const Packages = () => {
  const [categories, setCategories] = useState<FieldOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [cats, svcs] = await Promise.all([
        fetchCategoryOptions(),
        fetchServiceOptions(),
      ]);
      if (cancelled) return;
      setCategories(cats);
      setServices(svcs);
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

  const fields = useMemo(
    () => packageFields(categories, services),
    [categories, services],
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

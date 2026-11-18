// Trainer categories — /admin/trainer-categories on the API.
//
// Basic / Standard / Premium / Elite: the band a provider sits in (client,
// 17 Nov 2026). Four rows, so no paging and no search.
//
// **A band carries no price.** The rate is the service's `basePrice` whoever
// delivers the session; what the band decides is the **commission**, through
// a `CommissionRule` with scope `TRAINER_CATEGORY`. The counts in the table
// are what points at the band today.
//
// Deactivation is refused while providers or live commission rules still
// point at it — the same rule the geography masters follow. A band that went
// quietly inactive would drop its providers to the global commission with
// nobody having chosen that, so the API answers MASTER_IN_USE and names both
// counts; the toast shows that message.

import { useCallback } from 'react';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import StatusButton from './StatusButton';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import { pricingApi, type TrainerCategory } from '../../Services/pricing.api';

const columns: ColumnDef<TrainerCategory>[] = [
  { header: 'Band', cell: (r) => r.name },
  { header: 'Providers', cell: (r) => r._count?.instructors ?? 0 },
  { header: 'Commission rules', cell: (r) => r._count?.commissionRules ?? 0 },
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

const fields: FieldDef<TrainerCategory>[] = [
  { name: 'name', label: 'Band name', required: true },
  { name: 'sortOrder', label: 'Sort order', type: 'number', defaultValue: 0 },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox',
    defaultValue: true,
    createOnly: true,
  },
];

const TrainerCategories = () => {
  const load = useCallback(
    (query: { includeInactive?: boolean }) =>
      pricingApi.trainerCategories.list({
        includeInactive: query.includeInactive,
      }),
    [],
  );

  return (
    <CrudPage<TrainerCategory>
      title='Trainer Categories'
      singular='Trainer category'
      parent='Marketing'
      columns={columns}
      fields={fields}
      load={load}
      create={pricingApi.trainerCategories.create}
      update={pricingApi.trainerCategories.update}
      hasSearch={false}
      inactiveLabel='Show inactive'
      actionsWidth='200px'
      rowActions={(row, refresh) => (
        <StatusButton
          isActive={row.isActive}
          setStatus={(isActive) =>
            pricingApi.trainerCategories.setStatus(row.id, isActive)
          }
          onDone={refresh}
        />
      )}
    />
  );
};

export default TrainerCategories;

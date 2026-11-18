// Group slabs — /admin/group-slabs on the API.
//
// Group-size discounts from the client's pricing doc (17 Nov 2026): 3 people
// -20%, 5 -30%, 10 -50%. Read only for a service with `allowMultiPerson`; a
// head count with no row of its own falls back to the highest `minPersons`
// at or below it, which is why the table is three or four rows and has no
// paging and no search.
//
// **`minPersons` is the row's identity** and is unique in the database — two
// rows for one size would make the discount depend on row order. So it is a
// create-only field: the API rejects it in a PATCH, and moving a size means
// retiring one row and adding another. Creating a size that was retired
// revives that row rather than failing on the constraint.

import { useCallback } from 'react';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import StatusButton from './StatusButton';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import { pricingApi, type GroupSlab } from '../../Services/pricing.api';

const columns: ColumnDef<GroupSlab>[] = [
  {
    header: 'Group size',
    cell: (r) => (
      <div>
        <div>{r.minPersons} people and up</div>
        <span className='f-light f-12'>until the next slab</span>
      </div>
    ),
  },
  { header: 'Discount', cell: (r) => `${Number(r.percentOff)}% off` },
  {
    header: 'Status',
    cell: (r) => (
      <StatusBadge tone={r.isActive ? 'light-success' : 'light-secondary'}>
        {r.isActive ? 'Active' : 'Inactive'}
      </StatusBadge>
    ),
  },
];

const fields: FieldDef<GroupSlab>[] = [
  {
    name: 'minPersons',
    label: 'Smallest group',
    type: 'number',
    required: true,
    defaultValue: 3,
    createOnly: true,
    help: '2 to 200. A slab for one person is just the base price. Cannot be changed later — retire the row and add another.',
  },
  {
    name: 'percentOff',
    label: 'Percent off',
    type: 'number',
    required: true,
    defaultValue: 0,
    help: '0 to 100, taken off rate x people.',
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox',
    defaultValue: true,
    createOnly: true,
  },
];

const GroupSlabs = () => {
  const load = useCallback(
    (query: { includeInactive?: boolean }) =>
      pricingApi.groupSlabs.list({ includeInactive: query.includeInactive }),
    [],
  );

  return (
    <CrudPage<GroupSlab>
      title='Group Slabs'
      singular='Group slab'
      parent='Marketing'
      columns={columns}
      fields={fields}
      load={load}
      create={pricingApi.groupSlabs.create}
      update={pricingApi.groupSlabs.update}
      remove={pricingApi.groupSlabs.remove}
      deleteVerb='Delete'
      hasSearch={false}
      inactiveLabel='Show inactive'
      actionsWidth='200px'
      rowActions={(row, refresh) => (
        <StatusButton
          isActive={row.isActive}
          setStatus={(isActive) =>
            pricingApi.groupSlabs.setStatus(row.id, isActive)
          }
          onDone={refresh}
          offLabel='Retire'
        />
      )}
    />
  );
};

export default GroupSlabs;

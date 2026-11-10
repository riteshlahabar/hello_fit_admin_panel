import { useCallback } from 'react';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import { mastersApi } from '../../Services/masters.api';
import type { Branch } from '../../Services/masters.api';
import { useCityOptions } from './useCityOptions';

const columns: ColumnDef<Branch>[] = [
  { header: 'Branch', cell: (r) => r.name },
  { header: 'City', cell: (r) => r.city?.name ?? '—' },
  { header: 'Manager', cell: (r) => r.manager?.name ?? '—' },
  { header: 'Areas', cell: (r) => r._count?.serviceAreas ?? 0 },
  { header: 'Teachers', cell: (r) => r._count?.instructors ?? 0 },
  {
    header: 'Status',
    cell: (r) => (
      <StatusBadge tone={r.isActive ? 'light-success' : 'light-danger'}>
        {r.isActive ? 'Active' : 'Retired'}
      </StatusBadge>
    ),
  },
];

const Branches = () => {
  const cities = useCityOptions();

  const load = useCallback(
    (q: { q?: string; page?: number; includeInactive?: boolean }) =>
      mastersApi.branches.list(q),
    [],
  );

  // No manager picker yet — it takes an AdminUser id, and the admin-user
  // screen is the next one to be built. Assigning a manager is an API call
  // away once there is a list to choose from.
  const fields: FieldDef<Branch>[] = [
    {
      name: 'cityId',
      label: 'City',
      type: 'select',
      options: cities,
      required: true,
      createOnly: true,
    },
    { name: 'name', label: 'Branch name', required: true },
    { name: 'address', label: 'Address', type: 'textarea' },
    { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
  ];

  return (
    <CrudPage<Branch>
      title='Branches'
      singular='Branch'
      columns={columns}
      fields={fields}
      load={load}
      create={mastersApi.branches.create}
      update={mastersApi.branches.update}
      remove={mastersApi.branches.remove}
    />
  );
};

export default Branches;

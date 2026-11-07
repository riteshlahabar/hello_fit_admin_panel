import { useCallback } from 'react';
import StatusBadge from './StatusBadge';
import CrudPage from './CrudPage';
import type { ColumnDef, FieldDef } from './CrudPage';
import { mastersApi } from '../../Services/masters.api';
import type { City } from '../../Services/masters.api';

const columns: ColumnDef<City>[] = [
  { header: 'Name', cell: (r) => r.name },
  { header: 'State', cell: (r) => r.state ?? '—' },
  { header: 'Areas', cell: (r) => r._count?.serviceAreas ?? 0 },
  { header: 'Branches', cell: (r) => r._count?.branches ?? 0 },
  {
    header: 'Launch',
    cell: (r) => (r.launchDate ? r.launchDate.slice(0, 10) : '—'),
  },
  {
    header: 'Status',
    cell: (r) => (
      <StatusBadge tone={r.isActive ? 'light-success' : 'light-danger'}>
        {r.isActive ? 'Active' : 'Retired'}
      </StatusBadge>
    ),
  },
];

const fields: FieldDef<City>[] = [
  { name: 'name', label: 'City name', required: true },
  { name: 'state', label: 'State', placeholder: 'Maharashtra' },
  {
    name: 'launchDate',
    label: 'Launch date',
    type: 'date',
    help: 'The calendar day the city goes live.',
  },
  { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
];

const Cities = () => {
  const load = useCallback(
    (q: { q?: string; page?: number; includeInactive?: boolean }) =>
      mastersApi.cities.list(q),
    [],
  );

  return (
    <CrudPage<City>
      title='Cities'
      singular='City'
      description='Where the service operates. A city cannot be retired while areas, branches or customer addresses still point at it.'
      columns={columns}
      fields={fields}
      load={load}
      create={mastersApi.cities.create}
      update={mastersApi.cities.update}
      remove={mastersApi.cities.remove}
    />
  );
};

export default Cities;

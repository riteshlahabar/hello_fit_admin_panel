import { useCallback } from 'react';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import { mastersApi } from '../../Services/masters.api';
import type { ServiceArea } from '../../Services/masters.api';
import { useBranchOptions, useCityOptions } from './useCityOptions';

const columns: ColumnDef<ServiceArea>[] = [
  { header: 'Area', cell: (r) => r.name },
  { header: 'City', cell: (r) => r.city?.name ?? '—' },
  { header: 'Branch', cell: (r) => r.branch?.name ?? '—' },
  { header: 'Pincodes', cell: (r) => r._count?.pincodes ?? 0 },
  {
    header: 'Status',
    cell: (r) => (
      <StatusBadge tone={r.isActive ? 'light-success' : 'light-danger'}>
        {r.isActive ? 'Active' : 'Retired'}
      </StatusBadge>
    ),
  },
];

const Areas = () => {
  const cities = useCityOptions();
  const branches = useBranchOptions();

  const load = useCallback(
    (q: { q?: string; page?: number; includeInactive?: boolean }) =>
      mastersApi.areas.list(q),
    [],
  );

  // `cityId` is create-only on purpose: the API refuses to move an area
  // between cities, because every address and teacher-coverage row pointing
  // at it would be orphaned.
  const fields: FieldDef<ServiceArea>[] = [
    {
      name: 'cityId',
      label: 'City',
      type: 'select',
      options: cities,
      required: true,
      createOnly: true,
    },
    { name: 'name', label: 'Area name', required: true },
    { name: 'branchId', label: 'Branch', type: 'select', options: branches },
    { name: 'launchDate', label: 'Launch date', type: 'date' },
    { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
  ];

  return (
    <CrudPage<ServiceArea>
      title='Service Areas'
      singular='Service Area'
      columns={columns}
      fields={fields}
      load={load}
      create={mastersApi.areas.create}
      update={mastersApi.areas.update}
      remove={mastersApi.areas.remove}
    />
  );
};

export default Areas;

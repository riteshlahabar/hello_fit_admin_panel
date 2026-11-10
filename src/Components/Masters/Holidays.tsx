import { useCallback } from 'react';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import { mastersApi } from '../../Services/masters.api';
import type { Holiday } from '../../Services/masters.api';
import { useCityOptions } from './useCityOptions';

const columns: ColumnDef<Holiday>[] = [
  { header: 'Date', cell: (r) => r.date.slice(0, 10) },
  { header: 'Title', cell: (r) => r.title },
  {
    header: 'Scope',
    cell: (r) =>
      r.city ? (
        r.city.name
      ) : (
        <StatusBadge tone='light-primary'>National</StatusBadge>
      ),
  },
  {
    header: 'Blocks booking',
    cell: (r) => (
      <StatusBadge tone={r.blocksBooking ? 'light-danger' : 'light-secondary'}>
        {r.blocksBooking ? 'Yes' : 'No'}
      </StatusBadge>
    ),
  },
];

const Holidays = () => {
  const cities = useCityOptions();

  const load = useCallback(
    (q: { q?: string; page?: number; includeInactive?: boolean }) =>
      mastersApi.holidays.list(q),
    [],
  );

  // Scope is create-only: the API's uniqueness is on (date, cityId), so
  // moving a holiday between cities is a delete and a re-add.
  const fields: FieldDef<Holiday>[] = [
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'title', label: 'Title', required: true, placeholder: 'Republic Day' },
    {
      name: 'cityId',
      label: 'City',
      type: 'select',
      options: cities,
      createOnly: true,
    },
    {
      name: 'blocksBooking',
      label: 'Blocks booking',
      type: 'checkbox',
      defaultValue: true,
    },
  ];

  return (
    <CrudPage<Holiday>
      title='Holidays'
      singular='Holiday'
      columns={columns}
      fields={fields}
      load={load}
      create={mastersApi.holidays.create}
      update={mastersApi.holidays.update}
      remove={mastersApi.holidays.remove}
      deleteVerb='Delete'
      hasActiveFlag={false}
    />
  );
};

export default Holidays;

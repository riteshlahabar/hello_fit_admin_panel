import { useCallback } from 'react';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import { mastersApi } from '../../Services/masters.api';
import type { Language } from '../../Services/masters.api';

const columns: ColumnDef<Language>[] = [
  { header: 'Code', cell: (r) => r.code },
  { header: 'Name', cell: (r) => r.name },
  {
    header: 'Default',
    cell: (r) =>
      r.isDefault ? (
        <StatusBadge tone='light-primary'>Default</StatusBadge>
      ) : (
        '—'
      ),
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

// `code` is create-only: it is the key templates and the app look a language
// up by, so changing it would orphan every translation keyed to the old one.
const fields: FieldDef<Language>[] = [
  {
    name: 'code',
    label: 'Code',
    required: true,
    createOnly: true,
    placeholder: 'hi',
  },
  { name: 'name', label: 'Name', required: true, placeholder: 'Hindi' },
  {
    name: 'isDefault',
    label: 'Make default',
    type: 'checkbox',
  },
  { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
];

const Languages = () => {
  const load = useCallback(
    (q: { q?: string; page?: number; includeInactive?: boolean }) =>
      mastersApi.languages.list(q),
    [],
  );

  return (
    <CrudPage<Language>
      title='Languages'
      singular='Language'
      columns={columns}
      fields={fields}
      load={load}
      create={mastersApi.languages.create}
      update={mastersApi.languages.update}
      remove={mastersApi.languages.remove}
    />
  );
};

export default Languages;

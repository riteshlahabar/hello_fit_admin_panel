// Fitness categories (PDF 6.5) — /admin/catalog/categories on the API.
//
// On Cuba's HoverableRows table and ModalTag dialog (../Common/CrudPage).
//
// Add and Edit are both here because 6.5 grants them: "create fitness
// categories", "edit category information", "maintain category descriptions",
// "activate or deactivate categories". **Delete is not granted and is not
// here** — a category with services and historical bookings behind it is
// deactivated, not removed, and the API has no delete route to call.
//
// The slug is derived from the name by the API, not typed, so it is shown as
// table data and is absent from the form.

import { useCallback } from 'react';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import { catalogApi, type Category } from '../../Services/catalog.api';

const columns: ColumnDef<Category>[] = [
  {
    header: 'Name',
    cell: (r) => (
      <div>
        <div>{r.name}</div>
        <span className='f-light f-12'>{r.slug}</span>
      </div>
    ),
  },
  { header: 'Description', cell: (r) => r.description ?? '—' },
  {
    header: 'Image',
    // The thumbnail is the only honest check that a pasted URL resolves —
    // a broken link looks fine as text.
    cell: (r) =>
      r.imageUrl ? (
        <img
          src={r.imageUrl}
          alt={`${r.name} card`}
          style={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 6 }}
        />
      ) : (
        '—'
      ),
  },
  { header: 'Services', cell: (r) => r._count?.services ?? 0 },
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

const fields: FieldDef<Category>[] = [
  { name: 'name', label: 'Name', required: true },
  { name: 'sortOrder', label: 'Sort order', type: 'number', defaultValue: 0 },
  {
    name: 'imageUrl',
    label: 'Card image URL',
    wide: true,
    placeholder: 'https://…',
    help: 'Shown on the website home grid. Leave empty and the card falls back to the built-in image.',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    wide: true,
  },
  { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
];

const Categories = () => {
  const load = useCallback(
    (query: { q?: string; page?: number; includeInactive?: boolean }) =>
      catalogApi.categories.list(query),
    [],
  );

  return (
    <CrudPage<Category>
      title='Categories'
      singular='Category'
      parent='Catalog'
      columns={columns}
      fields={fields}
      load={load}
      create={catalogApi.categories.create}
      update={catalogApi.categories.update}
      inactiveLabel='Show inactive'
      actionsWidth='160px'
    />
  );
};

export default Categories;

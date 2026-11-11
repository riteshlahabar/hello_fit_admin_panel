// Provider services — review and visibility (PDF 6.5) —
// /admin/catalog/services on the API.
//
// **Read-only except for one switch.** 6.5 gives the administrator "review
// provider service information" and "manage permitted service visibility";
// 4.5 gives the *provider* the service's name, description and pricing. So
// there is no Add, no Edit and no Delete here, and the API has no route for
// any of them — the single row action is Show / Hide.
//
// Hiding does not cancel anything. The API reports how many sessions are
// already booked against the service and the message says they are unaffected.

import { useCallback, useEffect, useState } from 'react';
import { Input } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn } from '../../AbstractElements';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { ColumnDef } from '../Common/CrudPage';
import {
  catalogApi,
  fetchCategoryOptions,
  type CatalogService,
} from '../../Services/catalog.api';

const columns: ColumnDef<CatalogService>[] = [
  {
    header: 'Service',
    cell: (r) => (
      <div>
        <div>{r.name}</div>
        <span className='f-light f-12'>{r.slug}</span>
      </div>
    ),
  },
  {
    header: 'Category',
    cell: (r) => (
      <div>
        <div>{r.category?.name ?? '—'}</div>
        {/* An active service inside an inactive category is invisible to
            customers anyway; saying so here saves a support ticket. */}
        {r.category && !r.category.isActive ? (
          <span className='f-light f-12'>category inactive</span>
        ) : null}
      </div>
    ),
  },
  { header: 'Duration', cell: (r) => `${r.durationMin} min` },
  { header: 'Price', cell: (r) => `₹${Number(r.basePrice).toFixed(2)}` },
  { header: 'Bookings', cell: (r) => r._count?.bookings ?? 0 },
  {
    header: 'Visibility',
    cell: (r) => (
      <StatusBadge tone={r.isActive ? 'light-success' : 'light-secondary'}>
        {r.isActive ? 'Visible' : 'Hidden'}
      </StatusBadge>
    ),
  },
];

/** `POST :id/visibility` — the only administrative lever on a service. */
const VisibilityButton = ({
  service,
  onDone,
}: {
  service: CatalogService;
  onDone: () => void;
}) => {
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    setSaving(true);
    const result = await catalogApi.services.setVisibility(
      service.id,
      !service.isActive,
    );
    setSaving(false);
    if (result.ok) {
      // Carries the booked-session count when hiding.
      toast.success(result.message ?? 'Saved');
      onDone();
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <Btn
      attrBtn={{
        color: service.isActive ? 'warning' : 'primary',
        size: 'sm',
        outline: service.isActive,
        disabled: saving,
        onClick: () => void toggle(),
      }}>
      {service.isActive ? 'Hide' : 'Show'}
    </Btn>
  );
};

const Services = () => {
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const options = await fetchCategoryOptions();
      if (!cancelled) setCategories(options);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(
    (query: { q?: string; page?: number; includeInactive?: boolean }) =>
      catalogApi.services.list({
        ...query,
        ...(categoryId ? { categoryId } : {}),
      }),
    [categoryId],
  );

  return (
    <CrudPage<CatalogService>
      title='Services'
      singular='Service'
      parent='Catalog'
      columns={columns}
      fields={[]}
      load={load}
      canCreate={false}
      inactiveLabel='Show hidden'
      actionsWidth='120px'
      rowActions={(row, refresh) => (
        <VisibilityButton service={row} onDone={refresh} />
      )}
      toolbar={
        <Input
          type='select'
          bsSize='sm'
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className='hf-filter-control'
          aria-label='Filter by category'>
          <option value=''>Any category</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Input>
      }
    />
  );
};

export default Services;

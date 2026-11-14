// Membership plans — /admin/plans on the API.
//
// **Client instruction, 13 Nov 2026. Not in the v3 PDF** — recorded in
// state/open-points.md so a later session does not remove it as an ODT
// leftover. The customer-facing page was supplied as a design
// (`hellofit-membership-plans-subscription.html`).
//
// Shape agreed before building, per the project rule:
//   columns  Name · Icon · ₹/month · ₹/year · Popular · Features · Active
//   filter   Active / Inactive / All
//   actions  Features · Edit  (no Delete — see below)
//
// **No delete button**, because the API has no delete route: a plan a customer
// has chosen cannot vanish without orphaning that choice. Deactivating takes
// it off the website, which is what removing it means here.
//
// **Choosing a plan charges nothing.** The customer count column is a count of
// choices, not of subscriptions — there is no billing behind any of this.

import { useCallback, useState } from 'react';
import { Input } from 'reactstrap';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import FeaturesModal from './FeaturesModal';
import { plansApi, type Plan, type PlanListQuery } from '../../Services/plans.api';

/** "₹499" — whole rupees, as every price in this panel is written. */
const rupees = (value: number) =>
  value === 0 ? 'Free' : `₹${Math.round(value).toLocaleString('en-IN')}`;

const columns: ColumnDef<Plan>[] = [
  {
    header: 'Plan',
    cell: (r) => (
      <div>
        <div>
          {r.icon ? `${r.icon} ` : ''}
          {r.name}
        </div>
        <span className='f-light f-12'>{r.slug}</span>
      </div>
    ),
  },
  { header: 'Per month', cell: (r) => rupees(r.priceMonthly) },
  {
    header: 'Per year',
    // The design shows the yearly figure as a per-month price, which is how
    // the card reads it — not an annual total.
    cell: (r) => (r.priceYearly ? `${rupees(r.priceYearly)} / mo` : '—'),
  },
  {
    header: 'Popular',
    cell: (r) =>
      r.isPopular ? <StatusBadge tone='light-warning'>Most popular</StatusBadge> : '—',
  },
  { header: 'Features', cell: (r) => r.featureCount },
  {
    header: 'Chosen by',
    // Deliberately not called "Subscribers": nobody is subscribed to anything.
    cell: (r) => r.customerCount,
  },
  {
    header: 'State',
    cell: (r) => (
      <StatusBadge tone={r.isActive ? 'light-success' : 'light-secondary'}>
        {r.isActive ? 'On the website' : 'Hidden'}
      </StatusBadge>
    ),
  },
];

const fields: FieldDef<Plan>[] = [
  { name: 'name', label: 'Name', required: true, placeholder: 'Plus' },
  { name: 'icon', label: 'Icon', placeholder: '🔥', help: 'One emoji, shown on the card.' },
  { name: 'eyebrow', label: 'Kicker', placeholder: 'Build momentum' },
  { name: 'description', label: 'Description', type: 'textarea' },
  {
    name: 'priceMonthly',
    label: 'Price per month (₹)',
    type: 'number',
    help: 'Zero is allowed — the free tier.',
  },
  {
    name: 'priceYearly',
    label: 'Price per month, billed yearly (₹)',
    type: 'number',
  },
  {
    name: 'billingCaption',
    label: 'Billing caption',
    placeholder: 'Billed monthly · Cancel anytime',
  },
  {
    name: 'isPopular',
    label: 'Most popular',
    type: 'checkbox',
    help: 'Only one plan carries the ribbon; ticking this clears the others.',
  },
  { name: 'sortOrder', label: 'Order', type: 'number' },
  { name: 'isActive', label: 'Show on the website', type: 'checkbox' },
];

export default function Plans() {
  const [state, setState] = useState<PlanListQuery['isActive'] | ''>('');

  const load = useCallback(
    async () => plansApi.list(state === '' ? {} : { isActive: state }),
    [state],
  );

  return (
    <CrudPage<Plan>
      title='Plans'
      singular='Plan'
      columns={columns}
      fields={fields}
      load={load}
      create={plansApi.create}
      update={plansApi.update}
      reloadKey={state}
      hasSearch={false}
      hasActiveFlag={false}
      actionsWidth='210px'
      toolbar={
        <Input
          type='select'
          value={state}
          aria-label='Filter by state'
          style={{ width: '170px' }}
          onChange={(e) => setState(e.target.value as PlanListQuery['isActive'] | '')}
        >
          <option value=''>All plans</option>
          <option value='true'>On the website</option>
          <option value='false'>Hidden</option>
        </Input>
      }
      rowActions={(row, refresh) => <FeaturesModal plan={row} onDone={refresh} />}
    />
  );
}

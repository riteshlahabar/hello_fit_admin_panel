// One provider's service offerings — PDF 6.5, "review provider service
// information".
//
// Shows the unapproved and the deactivated deliberately: reviewing what is
// waiting is the whole purpose, so filtering them out would empty the screen
// of the only rows that need a decision.

import { Btn } from '../../AbstractElements';
import type { InstructorOffering } from '../../Services/instructors.api';

const money = (value: string | null) =>
  value === null ? null : `₹${Number(value).toLocaleString('en-IN')}`;

/** What the customer would actually pay: the provider's price, else the base. */
const effectivePrice = (offering: InstructorOffering) =>
  money(offering.customPrice) ?? money(offering.service.basePrice) ?? '—';

interface Props {
  rows: InstructorOffering[];
  onDecide: (serviceId: string, approved: boolean) => void;
}

const OfferingsTable = ({ rows, onDecide }: Props) => (
  <table className='table'>
    <thead>
      <tr>
        <th scope='col'>Service</th>
        <th scope='col'>Category</th>
        <th scope='col'>Price</th>
        <th scope='col'>Level</th>
        <th scope='col'>State</th>
        <th scope='col'>Actions</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={row.id}>
          <td>
            <div>{row.service.name}</div>
            <span className='f-light f-12'>
              {row.service.durationMin} min
              {row.service.isActive ? '' : ' · service retired'}
            </span>
          </td>
          <td>{row.service.category?.name ?? '—'}</td>
          <td>
            <div>{effectivePrice(row)}</div>
            {row.customPrice === null ? (
              <span className='f-light f-12'>base price</span>
            ) : null}
          </td>
          <td>{row.level}</td>
          <td>
            {row.approvedAt ? 'Published' : 'Awaiting approval'}
            {row.isActive ? '' : ' · inactive'}
          </td>
          <td>
            {row.approvedAt ? (
              <Btn
                attrBtn={{
                  color: 'danger',
                  size: 'sm',
                  outline: true,
                  onClick: () => onDecide(row.service.id, false),
                }}>
                Unpublish
              </Btn>
            ) : (
              <Btn
                attrBtn={{
                  color: 'primary',
                  size: 'sm',
                  onClick: () => onDecide(row.service.id, true),
                }}>
                Publish
              </Btn>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default OfferingsTable;

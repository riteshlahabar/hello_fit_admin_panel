// The two list sections of the trainer View dialog: the services the provider
// delivers, and their document set.
//
// Split out of `TrainerViewModal` because these two are rows while everything
// else in that dialog is a single value, and because no source file here goes
// past 200 lines.
//
// Read-only, both of them. Services are chosen in Edit (client, 20-11-2026 —
// the publish action is gone from the row menu) and documents are verified in
// the Documents dialog, which already has the buttons.

import StatusBadge from '../Common/StatusBadge';
import type { BadgeTone } from '../Common/StatusBadge';
import type { InstructorDetail } from '../../Services/instructors.api';

const title = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');

const DOC_TONE: Record<string, BadgeTone> = {
  PENDING: 'light-warning',
  VERIFIED: 'light-success',
  REJECTED: 'light-danger',
};

const TrainerViewLists = ({ row }: { row: InstructorDetail }) => {
  // Withdrawn offerings stay in the table as inactive rows; the panel shows
  // what the provider delivers today, so they are left out.
  const offerings = row.offerings.filter((o) => o.isActive);

  return (
    <>
      <section className='hf-view-section'>
        <h6 className='hf-view-heading'>{`Services (${offerings.length})`}</h6>
        {offerings.length === 0 ? (
          // The one consequence worth stating: without a service nobody can
          // find this provider on the website at all.
          <p className='f-light f-12 mb-0'>
            None selected, so this provider does not appear on the website. Add
            them under Edit.
          </p>
        ) : (
          <div className='table-responsive'>
            <table className='table hf-view-table'>
              <thead>
                <tr>
                  <th scope='col'>Service</th>
                  <th scope='col'>Category</th>
                  <th scope='col'>Duration</th>
                  <th scope='col'>Rate</th>
                  <th scope='col'>State</th>
                </tr>
              </thead>
              <tbody>
                {offerings.map((o) => (
                  <tr key={o.id}>
                    <td>{o.service.name}</td>
                    <td>{o.service.category?.name ?? '—'}</td>
                    <td>{`${o.service.durationMin} min`}</td>
                    {/* Admin's rate card — the provider does not set it
                        (client, 17-11-2026). */}
                    <td>
                      {`₹${Number(o.service.basePrice).toLocaleString('en-IN')}`}
                    </td>
                    <td>
                      {o.approvedAt ? (
                        <StatusBadge tone='light-success'>Published</StatusBadge>
                      ) : (
                        <StatusBadge tone='light-secondary'>
                          Not published
                        </StatusBadge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className='hf-view-section'>
        <h6 className='hf-view-heading'>{`Documents (${row.documents.length})`}</h6>
        {row.documents.length === 0 ? (
          <p className='f-light f-12 mb-0'>Nothing uploaded yet.</p>
        ) : (
          <div className='table-responsive'>
            <table className='table hf-view-table'>
              <thead>
                <tr>
                  <th scope='col'>Document</th>
                  <th scope='col'>Number</th>
                  <th scope='col'>Expires</th>
                  <th scope='col'>State</th>
                </tr>
              </thead>
              <tbody>
                {row.documents.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div>{title(d.docType)}</div>
                      {d.remarks ? (
                        <span className='f-light f-12'>{d.remarks}</span>
                      ) : null}
                    </td>
                    <td>{d.number || '—'}</td>
                    {/* Already `dd-mm-yyyy` from the API — printed, never
                        reparsed (hard rule 4). */}
                    <td>{d.expiryDate || '—'}</td>
                    <td>
                      <StatusBadge
                        tone={DOC_TONE[d.verifyStatus] ?? 'light-dark'}>
                        {title(d.verifyStatus)}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default TrainerViewLists;

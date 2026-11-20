// Teacher recruitment and verification (spec 5.2) — /admin/instructors on the
// API, the Teacher Manager role's main screen.
//
// On ../Common/CrudPage, like every other menu.
//
// No Add and no delete, because the API has neither route: a teacher applies
// from the app, and one who should not be working is blacklisted rather than
// deleted — their sessions, earnings and reviews have to survive.
//
// The Edit dialog carries the **ops-owned** fields only: branch, the services
// this provider may deliver, and the daily cap. Their own bio, languages and
// specialisations are theirs — `AdminUpdateInstructorDto` has no such fields
// and the API would refuse them. **Travel buffer and radius came off on
// 20-11-2026** (client); the columns remain, fed by the trainer app and by
// `scheduling.defaultTravelBufferMin`.
//
// **Services is how a provider reaches the website** (PDF 6.5, "manage
// permitted service visibility"). What is picked here is published — the
// row-menu publish dialog went with the same instruction — and the options
// are narrowed to the categories the provider chose at registration, which is
// what `specialisations` holds.
//
// **Stage and documents are not form fields.** Each is its own route with its
// own permission and its own refusals, so each is a dialog of its own in the
// row menu: `StageModal.tsx`, `DocumentsModal.tsx`, and `TrainerViewModal.tsx`
// above Edit. This file is the table and the fields only — the four were one
// 538-line file until 20-11-2026.

import { Fragment, useCallback, useState } from 'react';
import { Input } from 'reactstrap';
import StatusBadge from '../Common/StatusBadge';
import TrainerViewModal from './TrainerViewModal';
import DocumentsModal from './DocumentsModal';
import StageModal from './StageModal';
import CrudPage from '../Common/CrudPage';
import type { BadgeTone } from '../Common/StatusBadge';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import {
  instructorsApi,
  ONBOARDING_STAGES,
  type Instructor,
  type OnboardingStage,
} from '../../Services/instructors.api';
import { useBranchOptions } from '../Masters/useCityOptions';
import { useTrainerServiceOptions } from './useTrainerServiceOptions';

const STAGE_TONE: Record<OnboardingStage, BadgeTone> = {
  APPLIED: 'light-secondary',
  DOCUMENTS_SUBMITTED: 'light-info',
  SCREENING_CALL: 'light-info',
  DEMO_SESSION: 'light-primary',
  APPROVED: 'light-success',
  REJECTED: 'light-danger',
};

const title = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');

const columns: ColumnDef<Instructor>[] = [
  {
    header: 'Name',
    cell: (r) => (
      <div>
        <div>{r.name || '—'}</div>
        <span className='f-light f-12'>{r.user.mobile}</span>
      </div>
    ),
  },
  {
    header: 'Stage',
    cell: (r) => (
      <StatusBadge tone={STAGE_TONE[r.onboardingStage]}>
        {title(r.onboardingStage)}
      </StatusBadge>
    ),
  },
  // The four the client asked for on 19-11-2026, to judge an applicant from
  // the list instead of opening each file.
  {
    header: 'Experience',
    cell: (r) => (r.experienceYears > 0 ? `${r.experienceYears} yr` : '—'),
  },
  {
    header: 'Qualification',
    cell: (r) => (
      <div>
        <div>{r.qualification || '—'}</div>
        {r.institute ? (
          <span className='f-light f-12'>{r.institute}</span>
        ) : null}
      </div>
    ),
  },
  { header: 'City', cell: (r) => r.city || '—' },
  {
    header: 'Specialisations',
    cell: (r) =>
      r.specialisations.length > 0 ? r.specialisations.join(', ') : '—',
  },
  // Null is survivable: assignment scores distance from the home base.
  { header: 'Branch', cell: (r) => r.branch?.name ?? 'Unassigned' },
  {
    header: 'Rating',
    cell: (r) =>
      r.ratingCount > 0
        ? `${Number(r.ratingAvg).toFixed(2)} (${r.ratingCount})`
        : 'No reviews',
  },
];

const Instructors = () => {
  const branches = useBranchOptions();
  const servicesFor = useTrainerServiceOptions();
  const [stage, setStage] = useState('');

  // No "show deleted" flag on this list, so CrudPage's switch is off. The API
  // also filters on `kycStatus` and `status`; the client asked for neither as
  // a control, so those are shown and not filtered on.
  const load = useCallback(
    (query: { q?: string; page?: number }) =>
      instructorsApi.list({
        q: query.q,
        page: query.page,
        ...(stage ? { stage: stage as OnboardingStage } : {}),
      }),
    [stage],
  );

  /** The ops-owned fields: branch, the services allowed, the daily cap. */
  const fields: FieldDef<Instructor>[] = [
    {
      name: 'branchId',
      label: 'Branch',
      type: 'select',
      options: branches,
      readValue: (r) => r.branchId ?? '',
    },
    { name: 'dailySessionCap', label: 'Daily session cap', type: 'number' },
    {
      name: 'serviceIds',
      label: 'Services',
      type: 'multiselect',
      wide: true,
      // Narrowed per row, which is why `options` is given the row: the
      // catalogue is one list, but what this provider may deliver depends on
      // the categories they chose at registration.
      options: (_form, row) => servicesFor(row?.specialisations),
      help: 'Only their registration categories. This is what the site shows.',
      // The whole set goes on the wire — an id left out is withdrawn — so
      // the value is every service currently active on the row.
      readValue: (r) =>
        (r.instructorServices ?? []).map((o) => o.serviceId).join(','),
    },
  ];

  return (
    <CrudPage<Instructor>
      title='Trainers'
      singular='Trainer'
      parent='Management'
      columns={columns}
      fields={fields}
      load={load}
      update={instructorsApi.update}
      canCreate={false}
      hasActiveFlag={false}
      // Above Edit (client, 20-11-2026): look at the file, then change it.
      rowView={(row) => <TrainerViewModal instructor={row} />}
      rowActions={(row, refresh) => (
        <Fragment>
          <DocumentsModal instructor={row} />
          {/* No Services item: PDF 6.5's visibility switch is the Edit
              dialog's Services select now (client, 20-11-2026). */}
          <StageModal instructor={row} onDone={refresh} />
        </Fragment>
      )}
      toolbar={
        <Fragment>
          <Input
            type='select'
            bsSize='sm'
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className='hf-filter-control'
            aria-label='Filter by stage'>
            <option value=''>Any stage</option>
            {ONBOARDING_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Input>
        </Fragment>
      }
    />
  );
};

export default Instructors;

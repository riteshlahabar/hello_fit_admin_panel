// The Trainers table — its column list, lifted out of `Instructors.tsx` on
// 20-11-2026 to keep that file inside the project's 200-line limit.
//
// The order is the client's, same day: name, city, experience, category,
// service, rating, stage, status, then the row menu. Qualification and Branch
// came off in that instruction — both are still on the record (the View dialog
// shows the qualification, the Edit dialog sets the branch), just not here.

import StatusBadge from '../Common/StatusBadge';
import StatusToggle from './StatusToggle';
import type { BadgeTone } from '../Common/StatusBadge';
import type { ColumnDef } from '../Common/CrudPage';
import type {
  Instructor,
  OnboardingStage,
} from '../../Services/instructors.api';

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

// Column order is the client's, 20-11-2026: name, city, experience, category,
// service, rating, stage, status, action. Qualification and Branch came off in
// the same instruction — both are still on the record (the View dialog shows
// the qualification, the Edit dialog sets the branch), just not in the list.
const columns: ColumnDef<Instructor>[] = [
  {
    header: 'Name',
    width: '16%',
    cell: (r) => (
      <div>
        <div>{r.name || '—'}</div>
        <span className='f-light f-12'>{r.user.mobile}</span>
      </div>
    ),
  },
  { header: 'City', cell: (r) => r.city || '—' },
  {
    header: 'Experience',
    cell: (r) => (r.experienceYears > 0 ? `${r.experienceYears} yr` : '—'),
  },
  // "Category", not "Specialisations" (client, 20-11-2026): it is the same
  // `specialisations` field — the categories they chose at registration — and
  // Category is what every other screen calls it.
  {
    header: 'Category',
    width: '14%',
    cell: (r) =>
      r.specialisations.length > 0 ? r.specialisations.join(', ') : '—',
  },
  // What admin approved in the Edit dialog, which is also what the website
  // publishes. Empty means this provider is on no public listing.
  {
    header: 'Service',
    width: '18%',
    cell: (r) => {
      const names = (r.instructorServices ?? []).map((o) => o.service.name);
      return names.length > 0 ? names.join(', ') : '—';
    },
  },
  {
    header: 'Rating',
    cell: (r) =>
      r.ratingCount > 0
        ? `${Number(r.ratingAvg).toFixed(2)} (${r.ratingCount})`
        : 'No reviews',
  },
  {
    header: 'Stage',
    cell: (r) => (
      <StatusBadge tone={STAGE_TONE[r.onboardingStage]}>
        {title(r.onboardingStage)}
      </StatusBadge>
    ),
  },
  // A switch, not a badge (client, 20-11-2026). It still asks for a reason,
  // which the status route demands — see StatusToggle.tsx.
  {
    header: 'Status',
    cell: (r, refresh) => <StatusToggle instructor={r} onDone={refresh} />,
  },
];

export default columns;

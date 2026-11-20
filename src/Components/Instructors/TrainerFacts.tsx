// The fact grids of the trainer View dialog — client, 20-11-2026: "show all
// information there in compact format, professional design".
//
// Four labelled sections over one definition grid (`detail-view.scss`), not
// four tables: these are single values, and a table of one-cell rows is the
// shape that makes a profile read like a report instead of a file.
//
// **No date is constructed here.** `GET /admin/instructors/:id` formats every
// date `dd-mm-yyyy` on the way out (hard rule 4), so the strings are printed
// as they arrive — `new Date(…)` on one would reparse "11-20-2026" as a month.

import StatusBadge from '../Common/StatusBadge';
import type { InstructorDetail } from '../../Services/instructors.api';

/** One label/value pair. Blanks read as an em dash rather than vanishing. */
export const Fact = ({
  label,
  value,
  wide,
}: {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) => (
  <div className={wide ? 'hf-fact hf-fact-wide' : 'hf-fact'}>
    <span className='hf-fact-label'>{label}</span>
    <span className='hf-fact-value'>{value || '—'}</span>
  </div>
);

export const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className='hf-view-section'>
    <h6 className='hf-view-heading'>{title}</h6>
    <div className='hf-fact-grid'>{children}</div>
  </section>
);

const list = (values: string[]) => (values.length > 0 ? values.join(', ') : '');

const money = (value: string | null) =>
  value === null ? '' : `${Number(value).toFixed(2)}%`;

/** Everything the provider typed into the six-page registration wizard. */
export const ProfileFacts = ({ row }: { row: InstructorDetail }) => (
  <>
    <Section title='Personal'>
      <Fact label='Full name' value={row.name} />
      <Fact label='Mobile' value={row.user.mobile} />
      <Fact label='Gender' value={row.gender} />
      <Fact label='Date of birth' value={row.dob} />
      <Fact label='Languages' value={list(row.languages)} />
      <Fact label='Applied on' value={row.createdAt} />
    </Section>

    <Section title='Professional'>
      <Fact
        label='Experience'
        value={row.experienceYears > 0 ? `${row.experienceYears} yr` : ''}
      />
      <Fact label='Qualification' value={row.qualification} />
      <Fact label='Institute' value={row.institute} />
      <Fact label='Clients trained' value={row.clientsTrainedBand} />
      {/* The categories picked at registration — the same list that narrows
          the Edit dialog's Services select. */}
      <Fact label='Specialisations' value={list(row.specialisations)} wide />
      <Fact label='Bio' value={row.bio} wide />
    </Section>

    <Section title='Address and area'>
      <Fact label='Address' value={row.addressLine} wide />
      <Fact label='Landmark' value={row.landmark} />
      <Fact label='City' value={row.city} />
      <Fact label='State' value={row.state} />
      <Fact label='Pincode' value={row.pincode} />
      <Fact label='Serves' value={row.serviceLocality} />
      <Fact
        label='Home base'
        value={
          row.homeBaseLat && row.homeBaseLng
            ? `${row.homeBaseLat}, ${row.homeBaseLng}`
            : ''
        }
      />
    </Section>

    <Section title='Operations'>
      <Fact label='Branch' value={row.branch?.name ?? 'Unassigned'} />
      <Fact label='Daily session cap' value={String(row.dailySessionCap)} />
      <Fact
        label='Commission'
        value={money(row.commissionPct) || 'Service default'}
      />
      <Fact label='Duty status' value={row.dutyStatus.replace('_', ' ')} />
      <Fact label='Reliability' value={Number(row.reliabilityScore).toFixed(2)} />
      <Fact
        label='Rating'
        value={
          row.ratingCount > 0
            ? `${Number(row.ratingAvg).toFixed(2)} (${row.ratingCount})`
            : 'No reviews'
        }
      />
      <Fact label='Joined' value={row.joinedAt} />
      <Fact
        label='Upcoming sessions'
        value={String(row.upcomingSessions)}
      />
      {/* Why someone is suspended is the one thing a reviewer opens this
          panel for, so it is never hidden behind a hover. */}
      {row.statusReason ? (
        <Fact label='Status reason' value={row.statusReason} wide />
      ) : null}
    </Section>
  </>
);

/** Code of conduct and what is still blocking approval. */
export const OnboardingFacts = ({ row }: { row: InstructorDetail }) => (
  <Section title='Onboarding'>
    <Fact label='Progress' value={`${row.onboarding.progressPercent}%`} />
    <Fact
      label='Code of conduct'
      value={
        row.onboarding.codeOfConductAccepted ? (
          <StatusBadge tone='light-success'>Accepted</StatusBadge>
        ) : (
          <StatusBadge tone='light-secondary'>Not accepted</StatusBadge>
        )
      }
    />
    <Fact
      label='Blocking approval'
      value={
        row.approval.ok ? (
          <StatusBadge tone='light-success'>Nothing</StatusBadge>
        ) : (
          row.approval.reasons.join(' · ')
        )
      }
      wide
    />
  </Section>
);

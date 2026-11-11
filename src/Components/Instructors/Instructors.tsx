// Teacher recruitment and verification (spec 5.2) — /admin/instructors on the
// API, the Teacher Manager role's main screen.
//
// On Cuba's HoverableRows table and ModalTag dialog, the same shapes the
// masters, Administration and Customers screens use (../Common/CrudPage).
//
// No Add and no delete, because the API has neither route: a teacher creates
// their own record by applying from the app, and someone who should not be
// working is blacklisted, not deleted — the sessions, earnings and reviews
// attached to them have to survive.
//
// The Edit dialog carries **only the four ops-owned scheduling numbers** —
// branch, daily cap, travel buffer, travel radius. Those are the inputs the
// slot grid and the clash check run on, which is why the teacher may not set
// them and why their own bio, languages and specialisations are not editable
// here: `AdminUpdateInstructorDto` has no such fields and the API would refuse
// the request.
//
// **Stage is not a form field either.** `POST :id/stage` is gated on
// `instructors:approve`, demands a reason, and refuses `APPROVED` while any
// must-verify document is unverified or expired — naming which one. That
// refusal is the whole value of the route, so this screen surfaces it rather
// than trying to predict it; the dialog offers the stages the API said are
// reachable (`allowedStages` from the detail call) and nothing more.

import { Fragment, useCallback, useState } from 'react';
import { Button, Form, Input, Label, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import StatusBadge from '../Common/StatusBadge';
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
  // Null means head office has not assigned one yet; assignment scores
  // distance from the home base, not the branch, so this is not fatal.
  { header: 'Branch', cell: (r) => r.branch?.name ?? 'Unassigned' },
  {
    header: 'Rating',
    cell: (r) =>
      r.ratingCount > 0
        ? `${Number(r.ratingAvg).toFixed(2)} (${r.ratingCount})`
        : 'No reviews',
  },
];

/**
 * `POST :id/stage`. Reads the detail call on open rather than in an effect
 * keyed on the row: the table renders one of these per row, so an effect would
 * fire a detail request for every row on every page load.
 */
const StageModal = ({
  instructor,
  onDone,
}: {
  instructor: Instructor;
  onDone: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [allowed, setAllowed] = useState<OnboardingStage[]>([]);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [stage, setStage] = useState<OnboardingStage>(
    instructor.onboardingStage,
  );
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setStage(instructor.onboardingStage);
    setReason('');
    setOpen(true);
    setLoading(true);
    const result = await instructorsApi.get(instructor.id);
    setLoading(false);
    if (result.ok) {
      setAllowed(result.data.allowedStages ?? []);
      setBlockers(result.data.approval?.ok ? [] : (result.data.approval?.reasons ?? []));
    } else {
      toast.error(result.error.message);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = await instructorsApi.changeStage(instructor.id, {
      stage,
      reason: reason.trim(),
    });
    setSaving(false);

    if (result.ok) {
      toast.success(result.message ?? 'Stage updated');
      setOpen(false);
      onDone();
    } else {
      // "Awaiting verification: PAN, POLICE_VERIFICATION" — the message names
      // the rule and the documents, and that text is the whole value.
      toast.error(result.error.message);
    }
  };

  return (
    <Fragment>
      <Btn attrBtn={{ color: 'light', size: 'sm', onClick: () => void toggle() }}>
        Stage
      </Btn>
      <Modal className='fade show' isOpen={open} toggle={() => void toggle()}>
        <div className='modal-header'>
          <H5
            attrH5={{ className: 'modal-title' }}>{`Stage — ${instructor.name || instructor.user.mobile}`}</H5>
          <Button
            color='transparent'
            className='btn-close float-end'
            onClick={() => void toggle()}
            type='button'
            aria-label='Close'
          />
        </div>
        <ModalBody>
          {loading ? (
            <p className='mb-0'>Loading…</p>
          ) : (
            <Form className='needs-validation' onSubmit={submit}>
              <div className='mb-3'>
                <Label for='stage'>Stage *</Label>
                <Input
                  type='select'
                  id='stage'
                  required
                  value={stage}
                  onChange={(e) => setStage(e.target.value as OnboardingStage)}>
                  {ONBOARDING_STAGES.filter((s) =>
                    allowed.includes(s.value),
                  ).map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Input>
              </div>
              {/* Not description: these are the live blockers the API measured,
                  and without them Approve looks arbitrarily refused. */}
              {blockers.length > 0 ? (
                <ul className='mb-3 txt-danger'>
                  {blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
              <div className='mb-3'>
                <Label for='stageReason'>Reason *</Label>
                <Input
                  type='textarea'
                  id='stageReason'
                  rows={3}
                  required
                  minLength={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Btn
                attrBtn={{ color: 'primary', type: 'submit', disabled: saving }}>
                {saving ? 'Saving…' : 'Save'}
              </Btn>
              <Btn
                attrBtn={{
                  color: 'secondary',
                  className: 'm-l-5',
                  type: 'button',
                  onClick: () => void toggle(),
                }}>
                Cancel
              </Btn>
            </Form>
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

/** The document set, with verify and reject. `instructors:edit`. */
const DocumentsModal = ({ instructor }: { instructor: Instructor }) => {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<
    { id: string; docType: string; verifyStatus: string; expiresAt: string | null; remarks: string | null }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const read = useCallback(async () => {
    setLoading(true);
    const result = await instructorsApi.get(instructor.id);
    setLoading(false);
    if (result.ok) setDocs(result.data.documents ?? []);
    else toast.error(result.error.message);
  }, [instructor.id]);

  const decide = async (documentId: string, verifyStatus: 'VERIFIED' | 'REJECTED') => {
    // A rejection must carry a remark — the API refuses without one and the
    // teacher is told what to fix.
    let remarks: string | undefined;
    if (verifyStatus === 'REJECTED') {
      const typed = window.prompt('Why is this being rejected?');
      if (!typed || typed.trim().length < 3) return;
      remarks = typed.trim();
    }
    const result = await instructorsApi.verifyDocument(
      instructor.id,
      documentId,
      { verifyStatus, ...(remarks ? { remarks } : {}) },
    );
    if (result.ok) {
      toast.success(result.message ?? 'Saved');
      void read();
    } else {
      toast.error(result.error.message);
    }
  };

  const openFile = async (documentId: string) => {
    const result = await instructorsApi.documentUrl(instructor.id, documentId);
    if (result.ok && result.data?.url) window.open(result.data.url, '_blank');
    else if (!result.ok) toast.error(result.error.message);
  };

  // Reads on click, not in an effect keyed on `open`: the table renders one of
  // these per row, so an effect would be one detail call per row.
  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    await read();
  };

  return (
    <Fragment>
      <Btn
        attrBtn={{ color: 'light', size: 'sm', onClick: () => void toggle() }}>
        Documents
      </Btn>
      <Modal
        className='fade show'
        size='lg'
        isOpen={open}
        toggle={() => void toggle()}>
        <div className='modal-header'>
          <H5
            attrH5={{ className: 'modal-title' }}>{`Documents — ${instructor.name || instructor.user.mobile}`}</H5>
          <Button
            color='transparent'
            className='btn-close float-end'
            onClick={() => void toggle()}
            type='button'
            aria-label='Close'
          />
        </div>
        <ModalBody>
          {loading ? (
            <p className='mb-0'>Loading…</p>
          ) : docs.length === 0 ? (
            <p className='mb-0'>Nothing uploaded yet.</p>
          ) : (
            <table className='table'>
              <thead>
                <tr>
                  <th scope='col'>Document</th>
                  <th scope='col'>State</th>
                  <th scope='col'>Expires</th>
                  <th scope='col'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div>{title(d.docType)}</div>
                      {d.remarks ? (
                        <span className='f-light f-12'>{d.remarks}</span>
                      ) : null}
                    </td>
                    <td>{title(d.verifyStatus)}</td>
                    <td>
                      {d.expiresAt
                        ? new Date(d.expiresAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <div className='d-flex gap-2'>
                        <Btn
                          attrBtn={{
                            color: 'light',
                            size: 'sm',
                            onClick: () => void openFile(d.id),
                          }}>
                          View
                        </Btn>
                        <Btn
                          attrBtn={{
                            color: 'primary',
                            size: 'sm',
                            onClick: () => void decide(d.id, 'VERIFIED'),
                          }}>
                          Verify
                        </Btn>
                        <Btn
                          attrBtn={{
                            color: 'danger',
                            size: 'sm',
                            outline: true,
                            onClick: () => void decide(d.id, 'REJECTED'),
                          }}>
                          Reject
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

const Instructors = () => {
  const branches = useBranchOptions();
  const [stage, setStage] = useState('');

  // This list has no "show deleted" flag at all, so CrudPage's switch is off.
  //
  // The API also filters on `kycStatus` and `status`. The client asked for
  // neither as a control, so the columns show them and nothing filters on them.
  const load = useCallback(
    (query: { q?: string; page?: number }) =>
      instructorsApi.list({
        q: query.q,
        page: query.page,
        ...(stage ? { stage: stage as OnboardingStage } : {}),
      }),
    [stage],
  );

  /** The four ops-owned scheduling numbers. */
  const fields: FieldDef<Instructor>[] = [
    {
      name: 'branchId',
      label: 'Branch',
      type: 'select',
      options: branches,
      readValue: (r) => r.branchId ?? '',
    },
    { name: 'dailySessionCap', label: 'Daily session cap', type: 'number' },
    { name: 'travelBufferMin', label: 'Travel buffer (minutes)', type: 'number' },
    { name: 'travelRadiusKm', label: 'Travel radius (km)', type: 'number' },
  ];

  return (
    <CrudPage<Instructor>
      title='Instructors'
      singular='Instructor'
      parent='Management'
      columns={columns}
      fields={fields}
      load={load}
      update={instructorsApi.update}
      canCreate={false}
      hasActiveFlag={false}
      actionsWidth='360px'
      rowActions={(row, refresh) => (
        <Fragment>
          <DocumentsModal instructor={row} />
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

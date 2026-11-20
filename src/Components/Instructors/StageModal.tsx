// The stage decision — `POST /admin/instructors/:id/stage`, gated on
// `instructors:approve`.
//
// Lifted out of `Instructors.tsx` on 20-11-2026 so nothing there runs past the
// project's 200-line limit: the screen is the table and the fields, and each
// dialog is its own file.
//
// **The API, not this dialog, decides what is possible.** The route demands a
// reason and refuses `APPROVED` while any must-verify document is unverified
// or expired — naming which one. That refusal is the whole value of the
// route, so the dialog surfaces it rather than trying to predict it: it offers
// the stages the detail call said are reachable (`allowedStages`), narrowed to
// Approved and Rejected — the only two decisions admin makes (client,
// 20-11-2026).

import { Fragment, useState } from 'react';
import { Button, Form, Input, Label, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import {
  instructorsApi,
  DECIDABLE_STAGES,
  ONBOARDING_STAGES,
  type Instructor,
  type OnboardingStage,
} from '../../Services/instructors.api';

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
      const reachable = result.data.allowedStages ?? [];
      setAllowed(reachable);
      // The select only lists Approved and Rejected, so the current stage is
      // usually not among them — start on the first option actually shown, or
      // submit would post a stage nobody chose.
      const offered = DECIDABLE_STAGES.filter((s) => reachable.includes(s));
      if (offered.length > 0 && !offered.includes(instructor.onboardingStage)) {
        setStage(offered[0]);
      }
      setBlockers(result.data.approval?.ok ? [] : (result.data.approval?.reasons ?? []));
    } else {
      toast.error(result.error.message);
    }
  };

  const offered = ONBOARDING_STAGES.filter(
    (s) => DECIDABLE_STAGES.includes(s.value) && allowed.includes(s.value),
  );

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
          ) : offered.length === 0 ? (
            // An already-approved trainer: the API refuses both decisions, so
            // say so rather than showing a form that can only fail.
            <p className='mb-0'>
              No decision is open for this trainer — they are already approved.
            </p>
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
                  {offered.map((s) => (
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


export default StageModal;

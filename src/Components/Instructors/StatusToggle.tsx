// The Status column's Active / Inactive switch (client, 20-11-2026) —
// `POST /admin/instructors/:id/status`, gated on `instructors:approve`.
//
// **A switch, but not a bare switch.** `ChangeInstructorStatusDto` demands a
// reason of at least three characters, because that text reaches the teacher
// and the audit log; a canned string would make the log worthless. So flipping
// the switch opens a one-field dialog and the switch only moves once the API
// has taken it. Nothing is guessed locally — the row is re-read by `refresh`.
//
// Inactive is `SUSPENDED`, the reversible one. `BLACKLISTED` also reads as off,
// with its own label, and switching it back on reinstates to `ACTIVE` — the
// same route takes all three.

import { Fragment, useState } from 'react';
import { Button, Form, Input, Label, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import {
  instructorsApi,
  type Instructor,
  type InstructorStatus,
} from '../../Services/instructors.api';

const LABEL: Record<InstructorStatus, string> = {
  ACTIVE: 'Active',
  SUSPENDED: 'Inactive',
  BLACKLISTED: 'Blacklisted',
};

const StatusToggle = ({
  instructor,
  onDone,
}: {
  instructor: Instructor;
  onDone: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const active = instructor.status === 'ACTIVE';
  const next: InstructorStatus = active ? 'SUSPENDED' : 'ACTIVE';

  const toggle = () => {
    setReason('');
    setOpen((was) => !was);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = await instructorsApi.changeStatus(instructor.id, {
      status: next,
      reason: reason.trim(),
    });
    setSaving(false);

    if (result.ok) {
      // The response counts the sessions still booked with them — on a
      // suspension those need reassigning, so it is the one number to show.
      const booked = result.data.upcomingSessions;
      toast.success(
        next === 'SUSPENDED' && booked > 0
          ? `Set inactive — ${booked} upcoming session(s) need reassigning`
          : `Set ${LABEL[next].toLowerCase()}`,
      );
      setOpen(false);
      onDone();
    } else {
      toast.error(result.error.message);
    }
  };

  const id = `status-${instructor.id}`;

  return (
    <Fragment>
      <div className='form-check form-switch mb-0 d-flex align-items-center gap-2'>
        <Input
          type='checkbox'
          className='form-check-input mt-0'
          id={id}
          checked={active}
          onChange={toggle}
        />
        <Label className='form-check-label mb-0 f-12' for={id}>
          {LABEL[instructor.status]}
        </Label>
      </div>
      <Modal className='fade show' isOpen={open} toggle={toggle}>
        <div className='modal-header'>
          <H5 attrH5={{ className: 'modal-title' }}>
            {`Set ${LABEL[next].toLowerCase()} — ${instructor.name || instructor.user.mobile}`}
          </H5>
          <Button
            color='transparent'
            className='btn-close float-end'
            onClick={toggle}
            type='button'
            aria-label='Close'
          />
        </div>
        <ModalBody>
          <Form className='needs-validation' onSubmit={submit}>
            <div className='mb-3'>
              <Label for={`${id}-reason`}>Reason *</Label>
              <Input
                type='textarea'
                id={`${id}-reason`}
                rows={3}
                required
                minLength={3}
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <span className='f-light f-12'>
                Sent to the trainer and kept in the audit log.
              </span>
            </div>
            <Btn attrBtn={{ color: 'primary', type: 'submit', disabled: saving }}>
              {saving ? 'Saving…' : 'Save'}
            </Btn>
            <Btn
              attrBtn={{
                color: 'secondary',
                className: 'm-l-5',
                type: 'button',
                onClick: toggle,
              }}>
              Cancel
            </Btn>
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default StatusToggle;

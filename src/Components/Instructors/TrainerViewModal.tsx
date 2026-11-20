// The trainer View dialog — client, 20-11-2026: "give view option above edit
// and show all information there in compact format, professional design".
//
// Read-only on purpose. Every decision already has its own place in the row
// menu (Documents, Stage) or in Edit; this is the file a reviewer opens to
// judge an applicant without clicking into four dialogs to assemble it.
//
// Same open pattern as `DocumentsModal` in `Instructors.tsx`: the detail call
// is made **on click, not in an effect**. The table renders one of these per
// row, so an effect keyed on `open` would be one detail request per row on
// every page load.

import { Fragment, useState } from 'react';
import { Button, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import StatusBadge from '../Common/StatusBadge';
import { OnboardingFacts, ProfileFacts } from './TrainerFacts';
import TrainerViewLists from './TrainerViewLists';
import type { BadgeTone } from '../Common/StatusBadge';
import {
  instructorsApi,
  type Instructor,
  type InstructorDetail,
} from '../../Services/instructors.api';

const title = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');

const KYC_TONE: Record<string, BadgeTone> = {
  NOT_SUBMITTED: 'light-secondary',
  PENDING: 'light-warning',
  VERIFIED: 'light-success',
  REJECTED: 'light-danger',
};

const STATUS_TONE: Record<string, BadgeTone> = {
  ACTIVE: 'light-success',
  SUSPENDED: 'light-warning',
  BLACKLISTED: 'light-danger',
};

/** The name's initials, for the avatar when no photo was uploaded. */
const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

const TrainerViewModal = ({ instructor }: { instructor: Instructor }) => {
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState<InstructorDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    const result = await instructorsApi.get(instructor.id);
    setLoading(false);
    if (result.ok) setRow(result.data);
    else toast.error(result.error.message);
  };

  return (
    <Fragment>
      <Btn attrBtn={{ color: 'light', size: 'sm', onClick: () => void toggle() }}>
        View
      </Btn>
      <Modal
        className='fade show hf-view-dialog'
        size='lg'
        isOpen={open}
        toggle={() => void toggle()}>
        <div className='modal-header'>
          <H5 attrH5={{ className: 'modal-title' }}>
            {instructor.name || instructor.user.mobile}
          </H5>
          <Button
            color='transparent'
            className='btn-close float-end'
            onClick={() => void toggle()}
            type='button'
            aria-label='Close'
          />
        </div>
        <ModalBody>
          {loading || !row ? (
            <p className='mb-0'>{loading ? 'Loading…' : 'Nothing to show.'}</p>
          ) : (
            <Fragment>
              {/* The four facts that decide whether the rest is worth
                  reading, on one line above the detail. */}
              <header className='hf-view-head'>
                {row.photoUrl ? (
                  <img className='hf-view-avatar' src={row.photoUrl} alt='' />
                ) : (
                  <span className='hf-view-avatar hf-view-avatar-text'>
                    {initials(row.name)}
                  </span>
                )}
                <div className='hf-view-ident'>
                  <strong>{row.name || '—'}</strong>
                  <span className='f-light f-12'>{row.user.mobile}</span>
                </div>
                <div className='hf-view-tags'>
                  <StatusBadge tone='light-primary'>
                    {title(row.onboardingStage)}
                  </StatusBadge>
                  <StatusBadge tone={STATUS_TONE[row.status] ?? 'light-dark'}>
                    {title(row.status)}
                  </StatusBadge>
                  <StatusBadge tone={KYC_TONE[row.kycStatus] ?? 'light-dark'}>
                    {`KYC ${title(row.kycStatus)}`}
                  </StatusBadge>
                </div>
              </header>

              <ProfileFacts row={row} />
              <TrainerViewLists row={row} />
              <OnboardingFacts row={row} />
            </Fragment>
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default TrainerViewModal;

// Service offerings for one provider — PDF 6.5, "review provider service
// information" and "manage permitted service visibility".
//
// **This dialog is what puts a provider on the public website.**
// `provider-visibility.ts` on the API requires at least one approved, active
// offering before anyone appears in Find a Trainer (§5.5, "display only
// providers permitted to appear publicly"), and `approvedAt` had no writer
// anywhere in `src/` until that route existed. Approving here is the switch.
//
// Same shape as `DocumentsModal` in `Instructors.tsx`: a row button, a
// `size='lg'` Cuba modal, and the detail call read **on click rather than in
// an effect** — the table renders one of these per row, so an effect keyed on
// `open` would fire a detail request for every row on every page load.
//
// Session formats live here rather than in the CrudPage edit form: they answer
// the same question an administrator is already asking — what can this
// provider be found for — and that form carries the four scheduling fields and
// nothing else.

import { Fragment, useCallback, useState } from 'react';
import { Button, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import OfferingsTable from './OfferingsTable';
import SessionFormatPicker from './SessionFormatPicker';
import {
  instructorsApi,
  type Instructor,
  type InstructorOffering,
  type SessionFormat,
} from '../../Services/instructors.api';

const OfferingsModal = ({ instructor }: { instructor: Instructor }) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<InstructorOffering[]>([]);
  const [formats, setFormats] = useState<SessionFormat[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const read = useCallback(async () => {
    setLoading(true);
    const result = await instructorsApi.get(instructor.id);
    setLoading(false);
    if (result.ok) {
      setRows(result.data.offerings ?? []);
      setFormats(result.data.sessionFormats ?? []);
    } else {
      toast.error(result.error.message);
    }
  }, [instructor.id]);

  const decide = async (serviceId: string, approved: boolean) => {
    const result = await instructorsApi.setOfferingApproval(
      instructor.id,
      serviceId,
      approved,
    );
    if (result.ok) {
      toast.success(result.message ?? 'Saved');
      void read();
    } else {
      // The API refuses an approval when the service is retired or KYC is
      // unverified, and names which. Surfacing it is the point.
      toast.error(result.error.message);
    }
  };

  const toggleFormat = async (value: SessionFormat) => {
    const next = formats.includes(value)
      ? formats.filter((f) => f !== value)
      : [...formats, value];

    // The API refuses an empty list; refusing it here first says why rather
    // than bouncing the administrator off a 400.
    if (next.length === 0) {
      toast.error('A trainer must offer at least one session location.');
      return;
    }

    setSaving(true);
    const result = await instructorsApi.update(instructor.id, { sessionFormats: next });
    setSaving(false);

    if (result.ok) {
      setFormats(next);
      toast.success('Session locations updated');
    } else {
      toast.error(result.error.message);
    }
  };

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    await read();
  };

  const approvedCount = rows.filter((r) => r.approvedAt).length;

  return (
    <Fragment>
      <Btn attrBtn={{ color: 'light', size: 'sm', onClick: () => void toggle() }}>
        Services
      </Btn>
      <Modal className='fade show' size='lg' isOpen={open} toggle={() => void toggle()}>
        <div className='modal-header'>
          <H5 attrH5={{ className: 'modal-title' }}>
            {`Services — ${instructor.name || instructor.user.mobile}`}
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
          <SessionFormatPicker
            value={formats}
            disabled={saving || loading}
            onToggle={(value) => void toggleFormat(value)}
          />

          {/* The one fact an administrator needs at a glance: approve nothing
              and this provider is invisible on the website. */}
          {!loading && approvedCount === 0 ? (
            <div className='alert alert-warning py-2 f-12' role='alert'>
              No approved service, so this provider does not appear on the website.
            </div>
          ) : null}

          {loading ? (
            <p className='mb-0'>Loading…</p>
          ) : rows.length === 0 ? (
            <p className='mb-0'>This trainer has not listed any services yet.</p>
          ) : (
            <OfferingsTable rows={rows} onDecide={(id, approved) => void decide(id, approved)} />
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default OfferingsModal;

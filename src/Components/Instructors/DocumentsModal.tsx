// The document set for one provider, with verify and reject —
// `instructors:edit`.
//
// Lifted out of `Instructors.tsx` on 20-11-2026 for the 200-line limit.
//
// Read **on click, not in an effect**: the table renders one of these per row,
// so an effect keyed on `open` would be one detail request per row on every
// page load.

import { Fragment, useCallback, useState } from 'react';
import { Button, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import {
  instructorsApi,
  type Instructor,
  type InstructorDocument,
} from '../../Services/instructors.api';

const title = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');

/** The document set, with verify and reject. `instructors:edit`. */
const DocumentsModal = ({ instructor }: { instructor: Instructor }) => {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<InstructorDocument[]>([]);
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

  /**
   * Opens the document in a new tab.
   *
   * The tab is claimed **synchronously on the click**, before the request for
   * the signed URL. A browser only honours `window.open` while the user's
   * gesture is still live, and an `await` spends it — so opening afterwards
   * was silently blocked and showed as a tab that flashed and vanished with
   * nothing in it. Here the blank tab exists first and only its location is
   * set when the link arrives.
   */
  const openFile = (documentId: string) => {
    const tab = window.open('', '_blank');

    void (async () => {
      const result = await instructorsApi.documentUrl(instructor.id, documentId);

      if (result.ok && result.data?.url) {
        // No tab at all means popups are blocked outright; say so rather than
        // navigating the panel away from the review the admin is mid-way
        // through.
        if (tab) tab.location.href = result.data.url;
        else toast.error('Allow pop-ups for this site to view documents');
        return;
      }

      tab?.close();
      if (!result.ok) toast.error(result.error.message);
    })();
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
                    {/* `expiryDate` is the column's name and what the API
                        sends, already `dd-mm-yyyy` (hard rule 4). It used to
                        read `expiresAt` through `new Date()`: the field never
                        existed, so this column was always an em dash. */}
                    <td>{d.expiryDate || '—'}</td>
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

export default DocumentsModal;

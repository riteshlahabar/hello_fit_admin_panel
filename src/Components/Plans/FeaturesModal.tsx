// The ✓ / – list on a plan card — PDF-free, client instruction 13 Nov 2026.
//
// Same shape as `Instructors/OfferingsModal.tsx`: a row button, a dialog, one
// save. It edits the whole list and sends the whole list, because the design's
// card is an ordered list where a row can be added, removed, reordered or
// flipped between ✓ and – — replaying that as a sequence of per-row calls
// would mean the client getting the order right, which is the server's job.
//
// **The – rows matter as much as the ✓ rows.** A tier shows what it does not
// give you; dropping the excluded lines would quietly change the design.

import { useState } from 'react';
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { toast } from 'react-toastify';
import { plansApi, type Plan, type PlanFeature } from '../../Services/plans.api';

const MAX_FEATURES = 20;

export default function FeaturesModal({
  plan,
  onDone,
}: {
  plan: Plan;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<PlanFeature[]>([]);
  const [saving, setSaving] = useState(false);

  // Seeded when the dialog opens rather than in an effect: that tripped
  // the react-hooks set-state-in-effect rule, and the rule's own advice is to
  // update from the event that caused the change. Opening IS that event.
  const openDialog = () => {
    setRows(plan.features.map((f) => ({ ...f })));
    setOpen(true);
  };

  const setRow = (index: number, patch: Partial<PlanFeature>) =>
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );

  const save = async () => {
    const cleaned = rows
      .map((row) => ({ ...row, label: row.label.trim() }))
      .filter((row) => row.label.length > 0);

    if (cleaned.length === 0) {
      toast.error('A plan needs at least one line in its list.');
      return;
    }

    setSaving(true);
    const result = await plansApi.replaceFeatures(plan.id, cleaned);
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error?.message ?? 'Could not save the features.');
      return;
    }

    toast.success('Features updated');
    setOpen(false);
    onDone();
  };

  return (
    <>
      <Button color='light' size='sm' onClick={openDialog}>
        Features ({plan.featureCount})
      </Button>

      <Modal isOpen={open} toggle={() => setOpen(false)} centered size='lg'>
        <ModalHeader toggle={() => setOpen(false)}>
          {plan.name} — what&rsquo;s included
        </ModalHeader>

        <ModalBody>
          <p className='f-light f-12'>
            Ticked lines show as ✓ on the card; unticked show as – and are how a
            plan says what it does not include. Order here is the order shown.
          </p>

          {rows.map((row, index) => (
            <div className='d-flex align-items-center gap-2 mb-2' key={index}>
              <Input
                type='checkbox'
                checked={row.included}
                aria-label={row.included ? 'Included' : 'Not included'}
                onChange={(e) => setRow(index, { included: e.target.checked })}
              />
              <Input
                value={row.label}
                maxLength={120}
                placeholder='What this plan gives'
                onChange={(e) => setRow(index, { label: e.target.value })}
              />
              <Button
                close
                aria-label={`Remove ${row.label || 'this line'}`}
                onClick={() => setRows(rows.filter((_, i) => i !== index))}
              />
            </div>
          ))}

          <Button
            color='light'
            size='sm'
            disabled={rows.length >= MAX_FEATURES}
            onClick={() => setRows([...rows, { label: '', included: true }])}
          >
            Add a line
          </Button>
          {rows.length >= MAX_FEATURES ? (
            <span className='f-light f-12 ms-2'>Twenty is the maximum.</span>
          ) : null}
        </ModalBody>

        <ModalFooter>
          <Button color='light' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button color='primary' disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Save features'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

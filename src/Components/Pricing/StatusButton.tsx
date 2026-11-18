// Activate / deactivate for the three pricing menus.
//
// None of them has a delete route, so this button is how a row leaves the
// customer's dropdown. It is a row action rather than a checkbox on the edit
// dialog because the API keeps status on its own `PATCH :id/status` route —
// it is audited separately and, for a trainer category, it can be refused
// while providers still point at the band.
//
// The API's own message is shown on success: deactivating a package reports
// how many bookings already used it, and that count is the whole point of
// the toast.

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Btn } from '../../AbstractElements';

interface StatusButtonProps {
  isActive: boolean;
  setStatus: (
    isActive: boolean,
  ) => Promise<{ ok: boolean; message?: string | null; error?: { message: string } }>;
  onDone: () => void;
  /** Wording for the deactivate side — "Retire" reads better for a slab. */
  offLabel?: string;
  onLabel?: string;
}

const StatusButton = ({
  isActive,
  setStatus,
  onDone,
  offLabel = 'Deactivate',
  onLabel = 'Activate',
}: StatusButtonProps) => {
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    setSaving(true);
    const result = await setStatus(!isActive);
    setSaving(false);

    if (result.ok) {
      toast.success(result.message ?? 'Saved');
      onDone();
    } else {
      toast.error(result.error?.message ?? 'Could not complete that');
    }
  };

  return (
    <Btn
      attrBtn={{
        color: isActive ? 'warning' : 'primary',
        size: 'sm',
        outline: isActive,
        disabled: saving,
        onClick: () => void toggle(),
      }}>
      {isActive ? offLabel : onLabel}
    </Btn>
  );
};

export default StatusButton;

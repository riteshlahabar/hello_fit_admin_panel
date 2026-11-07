import { useCallback, useState } from 'react';
import { Button, Form, Input, Label, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import StatusBadge from './StatusBadge';
import CrudPage from './CrudPage';
import type { ColumnDef, FieldDef } from './CrudPage';
import { mastersApi } from '../../Services/masters.api';
import type { Pincode } from '../../Services/masters.api';
import { useAreaOptions } from './useCityOptions';

const columns: ColumnDef<Pincode>[] = [
  { header: 'Pincode', cell: (r) => r.code },
  { header: 'Area', cell: (r) => r.area?.name ?? '—' },
  { header: 'City', cell: (r) => r.area?.city?.name ?? '—' },
  {
    header: 'Status',
    cell: (r) => (
      <StatusBadge tone={r.isActive ? 'light-success' : 'light-danger'}>
        {r.isActive ? 'Active' : 'Retired'}
      </StatusBadge>
    ),
  },
];

/**
 * Bulk attach, in Cuba's ModalTag shape. A city launch arrives as a pasted
 * list of pincodes; the API reports which codes it skipped rather than failing
 * the batch on the first duplicate, and that report is what this surfaces.
 */
const BulkModal = ({
  areas,
  onDone,
}: {
  areas: { value: string; label: string }[];
  onDone: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [areaId, setAreaId] = useState('');
  const [codes, setCodes] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = () => setOpen((v) => !v);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const list = codes
      .split(/[\s,]+/)
      .map((c) => c.trim())
      .filter(Boolean);
    if (!areaId || list.length === 0) return;

    setSaving(true);
    const result = await mastersApi.pincodes.bulk({ areaId, codes: list });
    setSaving(false);

    if (result.ok) {
      const skipped = result.data.skipped ?? [];
      toast.success(
        `${result.data.created} mapped` +
          (skipped.length ? ` · ${skipped.length} already there` : ''),
      );
      setCodes('');
      setOpen(false);
      onDone();
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <>
      <Btn attrBtn={{ color: 'light', size: 'sm', onClick: toggle }}>
        Bulk add
      </Btn>
      <Modal className='fade show' size='lg' isOpen={open} toggle={toggle}>
        <div className='modal-header'>
          <H5 attrH5={{ className: 'modal-title' }}>Bulk add pincodes</H5>
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
              <Label for='bulkArea'>Area *</Label>
              <Input
                type='select'
                id='bulkArea'
                required
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}>
                <option value=''>— select —</option>
                {areas.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </Input>
            </div>
            <div className='mb-3'>
              <Label for='bulkCodes'>Pincodes *</Label>
              <Input
                type='textarea'
                id='bulkCodes'
                rows={6}
                required
                placeholder={'411001\n411002\n411003'}
                value={codes}
                onChange={(e) => setCodes(e.target.value)}
              />
              <span className='f-light f-12'>
                One per line, or separated by commas or spaces. Codes already
                mapped to the area are skipped and reported back.
              </span>
            </div>
            <Btn attrBtn={{ color: 'primary', type: 'submit', disabled: saving }}>
              {saving ? 'Adding…' : 'Add'}
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
    </>
  );
};

const Pincodes = () => {
  const areas = useAreaOptions();
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(
    (q: { q?: string; page?: number; includeInactive?: boolean }) =>
      mastersApi.pincodes.list(q),
    [],
  );

  const fields: FieldDef<Pincode>[] = [
    { name: 'code', label: 'Pincode', required: true, placeholder: '411001' },
    {
      name: 'areaId',
      label: 'Area',
      type: 'select',
      options: areas,
      required: true,
    },
    { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
  ];

  return (
    <CrudPage<Pincode>
      title='Pincodes'
      singular='Pincode'
      description='Pincode to service-area mapping. This is what decides whether an address falls inside a serviceable zone.'
      columns={columns}
      fields={fields}
      load={load}
      create={mastersApi.pincodes.create}
      update={mastersApi.pincodes.update}
      remove={mastersApi.pincodes.remove}
      deleteVerb='Unmap'
      reloadKey={reloadKey}
      toolbar={
        <BulkModal areas={areas} onDone={() => setReloadKey((k) => k + 1)} />
      }
    />
  );
};

export default Pincodes;

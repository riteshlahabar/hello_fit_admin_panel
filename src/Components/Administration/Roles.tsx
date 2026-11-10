// Roles and the permission catalogue (spec 5.8) — /admin/roles on the API.
//
// The matrix editor is the whole point of this screen. `PUT :id/permissions`
// replaces a role's set **wholesale** rather than applying a diff, so the
// dialog always sends every checked id; a half-applied diff would leave a role
// holding permissions nobody chose.
//
// Three rules the API enforces, mirrored here only so the button that cannot
// work is not offered:
//   - Built-in (`isSystem`) roles cannot be deleted, so Delete is hidden on
//     them. Edit stays, because their **description** is editable and only the
//     name is frozen; a rename attempt is refused by the API with that reason.
//     Their **permissions** are editable too — the spec's role-to-module
//     mapping is a starting point ops is expected to tune.
//   - Super Admin is the exception: its permissions cannot be stripped,
//     because it is the way back in if another role is mis-configured. The
//     dialog says so instead of offering a save that would 409.
//   - A role still assigned to an admin cannot be deleted. The refusal names
//     the count, and that message is surfaced as-is.
//
// `slug` is create-only: tokens and the seed key off it, so it is immutable.
//
// The matrix uses Cuba's own checkbox markup — `.checkbox > input + label`,
// inside `.m-checkbox-inline` (components/_radio.scss) — not Bootstrap's
// `.form-check`. Cuba's base/_reset.scss sets `form-check-input[type=checkbox]`
// to a transparent background **and** a transparent border, so a plain
// Bootstrap checkbox renders as nothing at all; the box is drawn by
// `label::before` and the tick is a themify glyph on `:checked + label`. The
// masters screens never hit this because every checkbox field there is a
// `form-switch`, which _switch.scss restyles.

import { Fragment, useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import {
  rolesApi,
  type Permission,
  type Role,
} from '../../Services/admins.api';

const SUPER_ADMIN_SLUG = 'super-admin';

const columns: ColumnDef<Role>[] = [
  {
    header: 'Role',
    cell: (r) => (
      <div>
        <div>{r.name}</div>
        <span className='f-light f-12'>{r.slug}</span>
      </div>
    ),
  },
  { header: 'Description', cell: (r) => r.description ?? '—' },
  { header: 'Admins', cell: (r) => r._count?.adminUsers ?? 0 },
  {
    header: 'Permissions',
    cell: (r) =>
      r.slug === SUPER_ADMIN_SLUG ? (
        <StatusBadge tone='light-primary'>Every permission</StatusBadge>
      ) : (
        (r._count?.rolePermissions ?? 0)
      ),
  },
  {
    header: 'Type',
    cell: (r) =>
      r.isSystem ? (
        <StatusBadge tone='light-info'>Built-in</StatusBadge>
      ) : (
        <StatusBadge tone='light-secondary'>Custom</StatusBadge>
      ),
  },
];

const fields: FieldDef<Role>[] = [
  {
    name: 'name',
    label: 'Role name',
    required: true,
    placeholder: 'Finance',
  },
  {
    name: 'slug',
    label: 'Slug',
    required: true,
    createOnly: true,
    placeholder: 'finance',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    wide: true,
  },
];

/** The catalogue, grouped by module in the order the API returns it. */
function groupByModule(permissions: Permission[]) {
  const groups: { module: string; items: Permission[] }[] = [];
  for (const permission of permissions) {
    const last = groups[groups.length - 1];
    if (last && last.module === permission.module) last.items.push(permission);
    else groups.push({ module: permission.module, items: [permission] });
  }
  return groups;
}

const humanise = (value: string) =>
  value.replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase());

/**
 * `PUT :id/permissions` — the matrix. Opens on the role's current set, read
 * from the detail route (the list response carries only a count).
 */
const PermissionsModal = ({
  role,
  catalogue,
  onDone,
}: {
  role: Role;
  catalogue: Permission[];
  onDone: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = role.slug === SUPER_ADMIN_SLUG;
  const groups = useMemo(() => groupByModule(catalogue), [catalogue]);

  // The current set is read on the click that opens the dialog, not from an
  // effect on `open`: the table holds one of these per role, and an effect
  // would turn rendering the list into one detail call per row.
  const openDialog = async () => {
    setOpen(true);
    if (isSuperAdmin) return;

    setLoading(true);
    const result = await rolesApi.get(role.id);
    if (result.ok) {
      setChecked(
        new Set((result.data.rolePermissions ?? []).map((rp) => rp.permissionId)),
      );
    } else {
      toast.error(result.error.message);
    }
    setLoading(false);
  };

  const toggle = () => setOpen((v) => !v);

  const toggleOne = (id: string) =>
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleModule = (items: Permission[], on: boolean) =>
    setChecked((current) => {
      const next = new Set(current);
      for (const item of items) {
        if (on) next.add(item.id);
        else next.delete(item.id);
      }
      return next;
    });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = await rolesApi.setPermissions(role.id, [...checked]);
    setSaving(false);

    if (result.ok) {
      toast.success('Permissions updated');
      setOpen(false);
      onDone();
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <Fragment>
      <Btn
        attrBtn={{ color: 'light', size: 'sm', onClick: () => void openDialog() }}>
        Permissions
      </Btn>
      <Modal className='fade show' size='lg' isOpen={open} toggle={toggle}>
        <div className='modal-header'>
          <H5
            attrH5={{
              className: 'modal-title',
            }}>{`Permissions — ${role.name}`}</H5>
          <Button
            color='transparent'
            className='btn-close float-end'
            onClick={toggle}
            type='button'
            aria-label='Close'
          />
        </div>
        <ModalBody>
          {isSuperAdmin ? (
            <Fragment>
              <p className='mb-3'>
                Super Admin keeps every permission. It is the way back in if
                another role is mis-configured, so its set cannot be edited —
                create a custom role instead and narrow that one.
              </p>
              <Btn
                attrBtn={{
                  color: 'secondary',
                  type: 'button',
                  onClick: toggle,
                }}>
                Close
              </Btn>
            </Fragment>
          ) : loading ? (
            <p className='mb-0'>Loading…</p>
          ) : (
            <Form className='needs-validation' onSubmit={submit}>
              {/* A live count, not a description — it is the only feedback
                  that the dialog opened on the role's real set. */}
              <span className='f-light f-12 d-block mb-3'>
                {`${checked.size} of ${catalogue.length} selected`}
              </span>

              {groups.map(({ module, items }) => {
                const all = items.every((i) => checked.has(i.id));
                return (
                  <div className='mb-2' key={module}>
                    <div className='checkbox checkbox-primary'>
                      <input
                        id={`module-${module}`}
                        type='checkbox'
                        checked={all}
                        onChange={(e) => toggleModule(items, e.target.checked)}
                      />
                      <label className='fw-bold' htmlFor={`module-${module}`}>
                        {humanise(module)}
                      </label>
                    </div>
                    <div className='m-checkbox-inline ps-4'>
                      {items.map((item) => (
                        <div className='checkbox checkbox-primary' key={item.id}>
                          <input
                            id={item.id}
                            type='checkbox'
                            checked={checked.has(item.id)}
                            onChange={() => toggleOne(item.id)}
                          />
                          <label
                            htmlFor={item.id}
                            title={item.description ?? undefined}>
                            {humanise(item.action)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <Btn
                attrBtn={{ color: 'primary', type: 'submit', disabled: saving }}>
                {saving ? 'Saving…' : 'Save permissions'}
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
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

const Roles = () => {
  const [catalogue, setCatalogue] = useState<Permission[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  // The catalogue is fixed by the seed, so it is fetched once for the screen
  // and shared by every row's dialog.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await rolesApi.permissions();
      if (!cancelled && result.ok) setCatalogue(result.data ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CrudPage<Role>
      title='Roles & Permissions'
      singular='Role'
      parent='Administration'
      columns={columns}
      fields={fields}
      load={rolesApi.list}
      create={rolesApi.create}
      update={rolesApi.update}
      remove={rolesApi.remove}
      deleteVerb='Delete'
      hasActiveFlag={false}
      hasSearch={false}
      actionsWidth='260px'
      reloadKey={reloadKey}
      canDelete={(r) => !r.isSystem}
      rowActions={(row) => (
        <PermissionsModal
          role={row}
          catalogue={catalogue}
          onDone={() => setReloadKey((k) => k + 1)}
        />
      )}
    />
  );
};

export default Roles;

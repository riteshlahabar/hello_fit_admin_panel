// Admin accounts (spec 5.8) — /admin/admin-users on the API.
//
// On Cuba's HoverableRows table and ModalTag dialog, the same shapes the
// masters screens use (../Common/CrudPage).
//
// Two things are deliberately not form fields. A **status change** and a
// **password reset** are their own API routes gated on `admins:approve`
// rather than `admins:edit`, because locking a colleague out or taking over
// their account is a different class of action from correcting their mobile
// number — so they are row actions with their own dialogs. `email` and
// `password` are create-only for the same reason: UpdateAdminUserDto omits
// both, so a PATCH of the profile form cannot silently change credentials.
//
// The API refuses the dangerous cases itself — deleting, suspending or
// demoting the last active super admin, and acting on your own account — and
// the refusal message says which rule it was. That message is surfaced as-is;
// this screen does not try to predict it.

import { Fragment, useCallback, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { BadgeTone } from '../Common/StatusBadge';
import type { ColumnDef, FieldDef } from '../Common/CrudPage';
import {
  adminUsersApi,
  PASSWORD_HELP,
  type AdminUser,
  type UserStatus,
} from '../../Services/admins.api';
import { useRoleOptions } from './useRoleOptions';
import { useBranchOptions } from '../Masters/useCityOptions';

const STATUS_TONE: Record<UserStatus, BadgeTone> = {
  ACTIVE: 'light-success',
  SUSPENDED: 'light-warning',
  DELETED: 'light-danger',
};

const columns: ColumnDef<AdminUser>[] = [
  {
    header: 'Name',
    cell: (r) => (
      <div>
        <div>{r.name}</div>
        <span className='f-light f-12'>{r.email}</span>
      </div>
    ),
  },
  { header: 'Mobile', cell: (r) => r.mobile ?? '—' },
  {
    header: 'Role',
    cell: (r) =>
      r.role ? (
        <StatusBadge tone={r.role.isSystem ? 'light-primary' : 'light-info'}>
          {r.role.name}
        </StatusBadge>
      ) : (
        '—'
      ),
  },
  // Null means every branch — Super Admin and head-office staff.
  { header: 'Branch', cell: (r) => r.branch?.name ?? 'All branches' },
  {
    header: 'Status',
    cell: (r) => (
      <StatusBadge tone={STATUS_TONE[r.status]}>
        {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
      </StatusBadge>
    ),
  },
  {
    header: 'Last login',
    cell: (r) =>
      r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString() : 'Never',
  },
];

/** `POST :id/status`. Suspending also revokes their refresh tokens. */
const StatusModal = ({
  admin,
  onDone,
}: {
  admin: AdminUser;
  onDone: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<UserStatus>(admin.status);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = () => {
    setStatus(admin.status);
    setReason('');
    setOpen((v) => !v);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = await adminUsersApi.changeStatus(admin.id, {
      status,
      // The API wants 3+ characters or nothing at all.
      ...(reason.trim().length >= 3 ? { reason: reason.trim() } : {}),
    });
    setSaving(false);

    if (result.ok) {
      toast.success('Status updated');
      setOpen(false);
      onDone();
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <Fragment>
      <Btn attrBtn={{ color: 'light', size: 'sm', onClick: toggle }}>
        Status
      </Btn>
      <Modal className='fade show' isOpen={open} toggle={toggle}>
        <div className='modal-header'>
          <H5 attrH5={{ className: 'modal-title' }}>{`Status — ${admin.name}`}</H5>
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
              <Label for='adminStatus'>Status *</Label>
              <Input
                type='select'
                id='adminStatus'
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}>
                <option value='ACTIVE'>Active</option>
                <option value='SUSPENDED'>Suspended</option>
              </Input>
            </div>
            <div className='mb-3'>
              <Label for='adminStatusReason'>Reason</Label>
              <Input
                type='textarea'
                id='adminStatusReason'
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
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

/** `POST :id/password`. Handed over out of band — no email is sent yet. */
const ResetPasswordModal = ({ admin }: { admin: AdminUser }) => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = () => {
    setPassword('');
    setConfirm('');
    setOpen((v) => !v);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      toast.error('The two passwords do not match');
      return;
    }
    setSaving(true);
    const result = await adminUsersApi.resetPassword(admin.id, password);
    setSaving(false);

    if (result.ok) {
      toast.success('Password reset. Their sessions have been signed out.');
      setOpen(false);
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <Fragment>
      <Btn attrBtn={{ color: 'light', size: 'sm', onClick: toggle }}>
        Password
      </Btn>
      <Modal className='fade show' isOpen={open} toggle={toggle}>
        <div className='modal-header'>
          <H5
            attrH5={{
              className: 'modal-title',
            }}>{`Reset password — ${admin.name}`}</H5>
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
              <Label for='newPassword'>New password *</Label>
              <Input
                type='password'
                id='newPassword'
                required
                autoComplete='new-password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className='f-light f-12'>{PASSWORD_HELP}</span>
            </div>
            <div className='mb-3'>
              <Label for='confirmPassword'>Confirm *</Label>
              <Input
                type='password'
                id='confirmPassword'
                required
                autoComplete='new-password'
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Btn attrBtn={{ color: 'primary', type: 'submit', disabled: saving }}>
              {saving ? 'Resetting…' : 'Reset'}
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

const AdminUsers = () => {
  const roles = useRoleOptions();
  const branches = useBranchOptions();
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState('');

  // `includeInactive` is CrudPage's name for the switch; the admin-user list
  // calls the flag `includeDeleted`, so the mapping happens here.
  const load = useCallback(
    (query: { q?: string; page?: number; includeInactive?: boolean }) =>
      adminUsersApi.list({
        q: query.q,
        page: query.page,
        includeDeleted: query.includeInactive,
        ...(roleId ? { roleId } : {}),
        ...(status ? { status } : {}),
      }),
    [roleId, status],
  );

  const fields: FieldDef<AdminUser>[] = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      createOnly: true,
    },
    { name: 'name', label: 'Full name', required: true },
    { name: 'mobile', label: 'Mobile', placeholder: '+91 98765 43210' },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      createOnly: true,
      help: PASSWORD_HELP,
    },
    {
      name: 'roleId',
      label: 'Role',
      type: 'select',
      options: roles,
      required: true,
      readValue: (r) => r.roleId,
    },
    {
      name: 'branchId',
      label: 'Branch',
      type: 'select',
      options: branches,
      readValue: (r) => r.branchId ?? '',
    },
  ];

  return (
    <CrudPage<AdminUser>
      title='Admin Users'
      singular='Admin'
      parent='Administration'
      columns={columns}
      fields={fields}
      load={load}
      create={adminUsersApi.create}
      update={adminUsersApi.update}
      remove={adminUsersApi.remove}
      deleteVerb='Remove'
      inactiveLabel='Show removed'
      actionsWidth='460px'
      rowActions={(row, refresh) => (
        <Fragment>
          <StatusModal admin={row} onDone={refresh} />
          <ResetPasswordModal admin={row} />
        </Fragment>
      )}
      toolbar={
        <Fragment>
          <Input
            type='select'
            bsSize='sm'
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className='hf-filter-control'
            aria-label='Filter by role'>
            <option value=''>All roles</option>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Input>
          <Input
            type='select'
            bsSize='sm'
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className='hf-filter-control'
            aria-label='Filter by status'>
            <option value=''>Any status</option>
            <option value='ACTIVE'>Active</option>
            <option value='SUSPENDED'>Suspended</option>
          </Input>
        </Fragment>
      }
    />
  );
};

export default AdminUsers;

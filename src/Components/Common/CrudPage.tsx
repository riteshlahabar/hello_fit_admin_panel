// One screen shape for all six masters, built from Cuba's own markup.
//
// The table is Cuba's `HoverableRows` pattern (4.8.26 --
// src/Components/Tables/Reactstrap/BasicTable/HoverableRows.jsx): Card >
// CardHeader > div.table-responsive > Table hover className
// 'table-border-horizontal'. The dialog is Cuba's `ModalTag` pattern
// (src/Components/Application/BookMarks/ModalTag.jsx): a Modal with a
// div.modal-header, an H5.modal-title, a transparent btn-close, and the form
// in a ModalBody. Pagination uses reactstrap's Pagination, styled by Cuba's
// components/_pagination rules.
//
// Factored into one component rather than copied six times: the six masters
// differ only in their columns and their form fields, and six near-identical
// copies is where they start drifting apart.
//
// It now backs the Administration screens too (admin users, roles), which is
// why `rowActions` and `inactiveLabel` exist: those two have actions the API
// exposes as their own routes rather than as a PATCH of the row — a status
// change, a password reset, a permission set — and they page off
// `includeDeleted` rather than `includeInactive`. The screen's own `load`
// maps the flag; nothing in here knows which name the API used.

import { Fragment, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Button,
  Card,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Table,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { Breadcrumbs, Btn, H3, H5 } from '../../AbstractElements';
import type { Listed, PageMeta } from '../../Services/masters.api';

/** A field in the add/edit dialog. */
export interface FieldDef<T> {
  name: string;
  label: string;
  type?:
    | 'text'
    | 'number'
    | 'date'
    | 'checkbox'
    | 'select'
    | 'textarea'
    | 'email'
    | 'password';
  /** Options for `select`. */
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  /** Hide the field when editing — e.g. a parent that must not be moved. */
  createOnly?: boolean;
  /** Full-width rather than Cuba's default half. */
  wide?: boolean;
  /** Initial value when adding. */
  defaultValue?: string | number | boolean;
  /** Pull the edit value out of the row when it is not a plain field. */
  readValue?: (row: T) => string | number | boolean | undefined;
}

export interface ColumnDef<T> {
  header: string;
  cell: (row: T) => ReactNode;
}

export interface CrudPageProps<T extends { id: string }> {
  title: string;
  /** Singular noun for the Add button and the dialog title. Spelled out
   * rather than derived — stripping a trailing s turns Cities into Citie. */
  singular: string;
  /** Breadcrumb trail under "Masters". */
  parent?: string;
  columns: ColumnDef<T>[];
  fields: FieldDef<T>[];
  load: (query: {
    q?: string;
    page?: number;
    includeInactive?: boolean;
  }) => Promise<{ ok: true; value: Listed<T> } | { ok: false; message: string }>;
  create: (body: Record<string, unknown>) => Promise<{ ok: boolean; error?: { message: string } }>;
  update: (
    id: string,
    body: Record<string, unknown>,
  ) => Promise<{ ok: boolean; error?: { message: string } }>;
  remove: (
    id: string,
  ) => Promise<{ ok: boolean; error?: { message: string } }>;
  /** Wording for the delete confirmation and the retire button. */
  deleteVerb?: string;
  /** Extra controls in the card header — a parent filter, for instance. */
  toolbar?: ReactNode;
  /** Bumped by a parent filter to force a reload. */
  reloadKey?: string | number;
  /** Masters with no isActive column hide the "show inactive" switch. */
  hasActiveFlag?: boolean;
  /** Wording for that switch — admin users show removed, not retired. */
  inactiveLabel?: string;
  /** Hide the search box where the endpoint has no `q` — the role list. */
  hasSearch?: boolean;
  /** Width of the Actions column. Fixed layout needs a real value here —
   * size it to the buttons the screen renders so the last one lands on the
   * 30px gutter. */
  actionsWidth?: string;
  /** Hide the delete button per row — a built-in role cannot be deleted. */
  canDelete?: (row: T) => boolean;
  /**
   * Buttons rendered before Edit, for actions the API exposes as their own
   * route. `refresh` re-reads the current page once the action lands.
   */
  rowActions?: (row: T, refresh: () => void) => ReactNode;
}

type FormState = Record<string, string | number | boolean>;

function initialForm<T>(fields: FieldDef<T>[]): FormState {
  const state: FormState = {};
  for (const f of fields) {
    state[f.name] =
      f.defaultValue ?? (f.type === 'checkbox' ? false : '');
  }
  return state;
}

function formFromRow<T extends { id: string }>(
  fields: FieldDef<T>[],
  row: T,
): FormState {
  const state: FormState = {};
  for (const f of fields) {
    const raw = f.readValue
      ? f.readValue(row)
      : (row as unknown as Record<string, unknown>)[f.name];
    if (f.type === 'checkbox') state[f.name] = Boolean(raw);
    else if (raw === null || raw === undefined) state[f.name] = '';
    else if (f.type === 'date') state[f.name] = String(raw).slice(0, 10);
    else state[f.name] = raw as string | number;
  }
  return state;
}

const CrudPage = <T extends { id: string }>({
  title,
  singular,
  parent = 'Masters',
  columns,
  fields,
  load,
  create,
  update,
  remove,
  deleteVerb = 'Retire',
  toolbar,
  reloadKey,
  hasActiveFlag = true,
  inactiveLabel = 'Show retired',
  hasSearch = true,
  actionsWidth = '225px',
  canDelete,
  rowActions,
}: CrudPageProps<T>) => {
  const [rows, setRows] = useState<T[]>([]);
  const [meta, setMeta] = useState<PageMeta>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [includeInactive, setIncludeInactive] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<FormState>(() => initialForm(fields));
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await load({ q: search || undefined, page, includeInactive });
    if (result.ok) {
      setRows(result.value.rows);
      setMeta(result.value.meta);
    } else {
      setError(result.message);
      setRows([]);
    }
    setLoading(false);
  }, [load, search, page, includeInactive]);

  useEffect(() => {
    void refresh();
  }, [refresh, reloadKey]);

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm(fields));
    setOpen(true);
  };

  const openEdit = (row: T) => {
    setEditing(row);
    setForm(formFromRow(fields, row));
    setOpen(true);
  };

  const toggle = () => setOpen((v) => !v);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    // Empty optional fields are omitted rather than sent as "" — the API's
    // ValidationPipe runs forbidNonWhitelisted and an empty string fails
    // @IsUUID / @IsDateString rather than reading as "not provided".
    const body: Record<string, unknown> = {};
    for (const f of fields) {
      if (editing && f.createOnly) continue;
      const value = form[f.name];
      if (f.type === 'checkbox') body[f.name] = Boolean(value);
      else if (value === '' || value === undefined) continue;
      else if (f.type === 'number') body[f.name] = Number(value);
      else body[f.name] = value;
    }

    const result = editing
      ? await update(editing.id, body)
      : await create(body);
    setSaving(false);

    if (result.ok) {
      toast.success(editing ? `${singular} updated` : `${singular} created`);
      setOpen(false);
      void refresh();
    } else {
      toast.error(result.error?.message ?? 'Something went wrong');
    }
  };

  const onDelete = async (row: T) => {
    const label =
      (row as unknown as Record<string, unknown>).name ??
      (row as unknown as Record<string, unknown>).title ??
      (row as unknown as Record<string, unknown>).code ??
      'this row';
    if (!window.confirm(`${deleteVerb} ${String(label)}?`)) return;

    const result = await remove(row.id);
    if (result.ok) {
      toast.success(`${deleteVerb}d`);
      void refresh();
    } else {
      // The API refuses with a reason — "3 service areas still point at this
      // city" — and that reason is the whole value of the message.
      toast.error(result.error?.message ?? 'Could not complete that');
    }
  };

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(q);
  };

  return (
    <Fragment>
      <Breadcrumbs mainTitle={title} parent={parent} title={title} />
      <Container fluid={true}>
        <Row>
          <Col sm='12'>
            <Card>
              <CardHeader>
                <Row className='align-items-center'>
                  <Col md='3'>
                    <H3>{title}</H3>
                  </Col>
                  <Col md='9'>
                    <div className='d-flex flex-wrap gap-2 justify-content-md-end align-items-center'>
                      {toolbar}
                      {hasSearch ? (
                        <Form className='d-flex gap-2' onSubmit={onSearch}>
                          <Input
                            type='search'
                            className='hf-filter-control'
                            bsSize='sm'
                            placeholder='Search…'
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                          />
                          <Btn
                            attrBtn={{
                              color: 'light',
                              size: 'sm',
                              type: 'submit',
                            }}>
                            Search
                          </Btn>
                        </Form>
                      ) : null}
                      {hasActiveFlag ? (
                        <div className='form-check form-switch mb-0'>
                          <Input
                            type='checkbox'
                            className='form-check-input'
                            id='includeInactive'
                            checked={includeInactive}
                            onChange={(e) => {
                              setPage(1);
                              setIncludeInactive(e.target.checked);
                            }}
                          />
                          <Label
                            className='form-check-label mb-0'
                            for='includeInactive'>
                            {inactiveLabel}
                          </Label>
                        </div>
                      ) : null}
                      <Btn
                        attrBtn={{
                          color: 'primary',
                          size: 'sm',
                          onClick: openAdd,
                        }}>
                        {`Add ${singular}`}
                      </Btn>
                    </div>
                  </Col>
                </Row>
              </CardHeader>

              <div className='table-responsive'>
                <Table hover={true} className='table-border-horizontal hf-crud-table'>
                  <thead>
                    <tr>
                      {columns.map((c) => (
                        <th scope='col' key={c.header}>
                          {c.header}
                        </th>
                      ))}
                      <th scope='col' style={{ width: actionsWidth }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={columns.length + 1}>Loading…</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={columns.length + 1} className='txt-danger'>
                          {error}
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 1}>
                          Nothing here yet.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr key={row.id}>
                          {columns.map((c) => (
                            <td key={c.header}>{c.cell(row)}</td>
                          ))}
                          <td>
                            <div className='d-flex gap-2 justify-content-center'>
                              {rowActions?.(row, () => void refresh())}
                              <Btn
                                attrBtn={{
                                  color: 'light',
                                  size: 'sm',
                                  onClick: () => openEdit(row),
                                }}>
                                Edit
                              </Btn>
                              {!canDelete || canDelete(row) ? (
                                <Btn
                                  attrBtn={{
                                    color: 'danger',
                                    size: 'sm',
                                    outline: true,
                                    onClick: () => void onDelete(row),
                                  }}>
                                  {deleteVerb}
                                </Btn>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {meta.pages > 1 ? (
                <div className='d-flex justify-content-between align-items-center hf-crud-foot'>
                  <span className='f-light'>
                    {meta.total} total · page {meta.page} of {meta.pages}
                  </span>
                  <Pagination className='mb-0'>
                    <PaginationItem disabled={meta.page <= 1}>
                      <PaginationLink
                        onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        Previous
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem disabled={meta.page >= meta.pages}>
                      <PaginationLink
                        onClick={() =>
                          setPage((p) => Math.min(meta.pages, p + 1))
                        }>
                        Next
                      </PaginationLink>
                    </PaginationItem>
                  </Pagination>
                </div>
              ) : null}
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal className='fade show' size='lg' isOpen={open} toggle={toggle}>
        <div className='modal-header'>
          <H5 attrH5={{ className: 'modal-title' }}>
            {editing ? `Edit ${singular}` : `Add ${singular}`}
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
          <Form className='needs-validation' onSubmit={onSubmit}>
            <div className='form-row row'>
              {fields
                .filter((f) => !(editing && f.createOnly))
                .map((f) => (
                  <FormGroup
                    className={f.wide ? 'col-md-12' : 'col-md-6'}
                    key={f.name}>
                    {f.type === 'checkbox' ? (
                      <div className='form-check form-switch mt-4'>
                        <Input
                          type='checkbox'
                          className='form-check-input'
                          id={f.name}
                          checked={Boolean(form[f.name])}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              [f.name]: e.target.checked,
                            }))
                          }
                        />
                        <Label className='form-check-label' for={f.name}>
                          {f.label}
                        </Label>
                      </div>
                    ) : (
                      <>
                        <Label for={f.name}>
                          {f.label}
                          {f.required ? ' *' : ''}
                        </Label>
                        {f.type === 'select' ? (
                          <Input
                            type='select'
                            id={f.name}
                            required={f.required}
                            value={String(form[f.name] ?? '')}
                            onChange={(e) =>
                              setForm((s) => ({
                                ...s,
                                [f.name]: e.target.value,
                              }))
                            }>
                            <option value=''>— select —</option>
                            {(f.options ?? []).map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </Input>
                        ) : (
                          <Input
                            type={f.type === 'textarea' ? 'textarea' : f.type ?? 'text'}
                            id={f.name}
                            required={f.required}
                            placeholder={f.placeholder}
                            value={String(form[f.name] ?? '')}
                            onChange={(e) =>
                              setForm((s) => ({
                                ...s,
                                [f.name]: e.target.value,
                              }))
                            }
                          />
                        )}
                        {f.help ? (
                          <span className='f-light f-12'>{f.help}</span>
                        ) : null}
                      </>
                    )}
                  </FormGroup>
                ))}
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

export default CrudPage;

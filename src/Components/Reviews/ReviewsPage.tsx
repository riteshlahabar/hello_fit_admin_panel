// Reviews and complaints (PDF 6.10) — /admin/reviews on the API.
//
// On Cuba's HoverableRows table and ModalTag dialog (../Common/CrudPage).
//
// **One component, two screens** — client instruction, 10 Nov 2026. Customer
// Reviews and Instructor Reviews are the same table over a different
// `direction`, so they share this file rather than being copied: a second copy
// is where the moderation rules would start to drift apart.
//
// The two are genuinely different things, which is why they are two menus and
// not one table with a direction column:
//
//   - **Customer → Instructor** is public once published. Moderating it
//     changes what customers see.
//   - **Instructor → Customer** is **internal**. It carries a confidential
//     note that the customer must never read; it is shown here because this
//     route is admin-only, and must never be copied onto a customer-facing
//     response.
//
// 6.10 asks for: view reviews, view the associated provider and booking,
// moderate according to configured rules, and view complaints if that module
// exists. There is no complaints module, so what stands in is the **reports
// raised against a review**, shown as a count on the row and listed in the
// dialog.
//
// No Add, no Edit, no Delete — 6.10 gives the administrator moderation only.
//
// The state filter offers **Pending and Submitted only**. Rows in other states
// still appear; they are simply not filterable, because this screen is the
// queue of what has not been dealt with.

import { Fragment, useCallback, useState } from 'react';
import { Button, Form, Input, Label, Modal, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Btn, H5 } from '../../AbstractElements';
import StatusBadge from '../Common/StatusBadge';
import CrudPage from '../Common/CrudPage';
import type { BadgeTone } from '../Common/StatusBadge';
import type { ColumnDef } from '../Common/CrudPage';
import {
  REVIEW_STATES,
  REVIEW_STATE_FILTERS,
  reviewsApi,
  type Review,
  type ReviewDirection,
  type ReviewState,
} from '../../Services/reviews.api';

const STATE_TONE: Record<ReviewState, BadgeTone> = {
  PENDING: 'light-secondary',
  SUBMITTED: 'light-info',
  PUBLISHED: 'light-success',
  FLAGGED: 'light-warning',
  HIDDEN: 'light-danger',
  EXPIRED: 'light-secondary',
};

const labelOf = (state: ReviewState) =>
  REVIEW_STATES.find((s) => s.value === state)?.label ?? state;

const columnsFor = (direction: ReviewDirection): ColumnDef<Review>[] => [
  { header: 'Booking', cell: (r) => r.booking?.code ?? '—' },
  // Author first, subject second, so the row reads in the direction the
  // review was written.
  ...(direction === 'CUSTOMER_TO_INSTRUCTOR'
    ? [
        { header: 'Customer', cell: (r: Review) => r.customerName ?? '—' },
        { header: 'Instructor', cell: (r: Review) => r.instructorName ?? '—' },
      ]
    : [
        { header: 'Instructor', cell: (r: Review) => r.instructorName ?? '—' },
        { header: 'Customer', cell: (r: Review) => r.customerName ?? '—' },
      ]),
  {
    header: 'Rating',
    cell: (r) => (
      <StatusBadge
        tone={
          r.overallRating >= 4
            ? 'light-success'
            : r.overallRating >= 3
              ? 'light-warning'
              : 'light-danger'
        }>
        {`${r.overallRating} / 5`}
      </StatusBadge>
    ),
  },
  {
    header: 'Comment',
    cell: (r) => (
      <div>
        <div>{r.comment ? truncate(r.comment) : '—'}</div>
        {/* The complaint trail 6.10 asks about — reports open against it. */}
        {r.reports.length > 0 ? (
          <span className='f-light f-12'>
            {`${r.reports.length} report${r.reports.length === 1 ? '' : 's'}`}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    header: 'State',
    cell: (r) => (
      <div>
        <StatusBadge tone={STATE_TONE[r.state]}>
          {labelOf(r.state)}
        </StatusBadge>
        {r.flagReason ? (
          <div className='f-light f-12'>{r.flagReason}</div>
        ) : null}
      </div>
    ),
  },
];

function truncate(value: string): string {
  return value.length > 70 ? `${value.slice(0, 70)}…` : value;
}

/**
 * Approve / hide, with the full comment and the open reports in view — the
 * moderator should not have to decide from a truncated cell.
 */
const ModerateModal = ({
  review,
  onDone,
}: {
  review: Review;
  onDone: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = () => {
    setReason('');
    setOpen((v) => !v);
  };

  const act = async (action: 'approve' | 'hide') => {
    setSaving(true);
    const text = reason.trim();
    const result =
      action === 'approve'
        ? await reviewsApi.approve(review.id, text || undefined)
        : await reviewsApi.hide(review.id, text || undefined);
    setSaving(false);

    if (result.ok) {
      toast.success(result.message ?? 'Saved');
      setOpen(false);
      onDone();
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <Fragment>
      <Btn attrBtn={{ color: 'light', size: 'sm', onClick: toggle }}>
        Moderate
      </Btn>
      <Modal className='fade show' size='lg' isOpen={open} toggle={toggle}>
        <div className='modal-header'>
          <H5
            attrH5={{ className: 'modal-title' }}>{`Review — ${review.booking?.code ?? ''}`}</H5>
          <Button
            color='transparent'
            className='btn-close float-end'
            onClick={toggle}
            type='button'
            aria-label='Close'
          />
        </div>
        <ModalBody>
          <table className='table'>
            <tbody>
              <tr>
                <th scope='row'>Customer</th>
                <td>{review.customerName ?? '—'}</td>
              </tr>
              <tr>
                <th scope='row'>Provider</th>
                <td>{review.instructorName ?? '—'}</td>
              </tr>
              <tr>
                <th scope='row'>Session</th>
                <td>
                  {review.session
                    ? new Date(review.session.sessionDate).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
              <tr>
                <th scope='row'>Rating</th>
                <td>{`${review.overallRating} / 5`}</td>
              </tr>
              <tr>
                <th scope='row'>Comment</th>
                <td>{review.comment ?? '—'}</td>
              </tr>
              {review.tags.length > 0 ? (
                <tr>
                  <th scope='row'>Tags</th>
                  <td>{review.tags.join(', ')}</td>
                </tr>
              ) : null}
              {review.confidentialNote ? (
                <tr>
                  {/* Internal. The customer never sees this text. */}
                  <th scope='row'>Private note</th>
                  <td className='txt-danger'>{review.confidentialNote}</td>
                </tr>
              ) : null}
              {review.reply ? (
                <tr>
                  <th scope='row'>Provider reply</th>
                  <td>{review.reply}</td>
                </tr>
              ) : null}
              {review.flagReason ? (
                <tr>
                  <th scope='row'>Flagged for</th>
                  <td>{review.flagReason}</td>
                </tr>
              ) : null}
              {review.hiddenReason ? (
                <tr>
                  <th scope='row'>Hidden because</th>
                  <td>{review.hiddenReason}</td>
                </tr>
              ) : null}
              {review.reports.length > 0 ? (
                <tr>
                  <th scope='row'>Reports</th>
                  <td>
                    <ul className='mb-0'>
                      {review.reports.map((rep) => (
                        <li key={rep.id}>{rep.reason}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          <Form
            className='needs-validation'
            onSubmit={(e) => e.preventDefault()}>
            <div className='mb-3'>
              <Label for='moderationNote'>Note</Label>
              <Input
                type='textarea'
                id='moderationNote'
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Btn
              attrBtn={{
                color: 'primary',
                type: 'button',
                disabled: saving,
                onClick: () => void act('approve'),
              }}>
              Approve
            </Btn>
            <Btn
              attrBtn={{
                color: 'danger',
                outline: true,
                className: 'm-l-5',
                type: 'button',
                disabled: saving,
                onClick: () => void act('hide'),
              }}>
              Hide
            </Btn>
            <Btn
              attrBtn={{
                color: 'secondary',
                className: 'm-l-5',
                type: 'button',
                onClick: toggle,
              }}>
              Close
            </Btn>
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

const ReviewsPage = ({
  title,
  direction,
}: {
  title: string;
  direction: ReviewDirection;
}) => {
  const [state, setState] = useState('');
  const [rating, setRating] = useState('');

  const load = useCallback(
    (query: { q?: string; page?: number }) =>
      reviewsApi.list({
        q: query.q,
        page: query.page,
        direction,
        ...(state ? { state: state as ReviewState } : {}),
        ...(rating ? { rating: Number(rating) } : {}),
      }),
    [direction, state, rating],
  );

  return (
    <CrudPage<Review>
      title={title}
      singular='Review'
      parent='Reviews'
      columns={columnsFor(direction)}
      fields={[]}
      load={load}
      canCreate={false}
      hasActiveFlag={false}
      actionsWidth='150px'
      rowActions={(row, refresh) => (
        <ModerateModal review={row} onDone={refresh} />
      )}
      toolbar={
        <Fragment>
          <Input
            type='select'
            bsSize='sm'
            value={state}
            onChange={(e) => setState(e.target.value)}
            className='hf-filter-control'
            aria-label='Filter by state'>
            <option value=''>Any state</option>
            {REVIEW_STATE_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Input>
          <Input
            type='select'
            bsSize='sm'
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className='hf-filter-control'
            aria-label='Filter by rating'>
            <option value=''>Any rating</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {`${n} star${n === 1 ? '' : 's'}`}
              </option>
            ))}
          </Input>
        </Fragment>
      }
    />
  );
};

export default ReviewsPage;

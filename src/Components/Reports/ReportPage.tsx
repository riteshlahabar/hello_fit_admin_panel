// The frame each PDF 6.12 report sits in: breadcrumbs, the shared From/To
// range card, then the report itself.
//
// One report per route — client instruction, 11 Nov 2026, replacing the single
// screen with a report dropdown. Each report is its own sidebar item under
// Reports, so the range belongs to the report you are looking at rather than
// being shared with three you are not.
//
// The range is applied on **Apply**, not on every keystroke: a half-typed date
// is a 400 from the API, and refetching per character is worse.

import { Fragment, useState } from 'react';
import { Col, Container, Form, Input, Label, Row } from 'reactstrap';
import { Breadcrumbs, Btn } from '../../AbstractElements';
import { day, type RangeQuery } from '../../Services/reports.api';

/** Matches the API default: the last 30 days, ending today. */
const DEFAULT_RANGE: RangeQuery = { from: day(-29), to: day() };

export interface ReportPageProps {
  title: string;
  /** Rendered with the range the administrator applied. */
  render: (range: RangeQuery) => React.ReactNode;
}

const ReportPage = ({ title, render }: ReportPageProps) => {
  // `draft` is what the inputs hold; `range` is what the report was asked
  // for. Keeping them apart is what makes Apply mean something.
  const [draft, setDraft] = useState<RangeQuery>(DEFAULT_RANGE);
  const [range, setRange] = useState<RangeQuery>(DEFAULT_RANGE);

  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    setRange(draft);
  };

  const reset = () => {
    setDraft(DEFAULT_RANGE);
    setRange(DEFAULT_RANGE);
  };

  return (
    <Fragment>
      <Breadcrumbs mainTitle={title} parent='Reports' title={title} />
      <Container fluid={true}>
        <Row>
          <Col sm='12'>
            <Form className='card hf-report-filters mb-3' onSubmit={apply}>
              <div className='d-flex flex-wrap gap-3 align-items-end'>
                <div>
                  <Label for='from'>From</Label>
                  <Input
                    type='date'
                    id='from'
                    bsSize='sm'
                    value={draft.from ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
                  />
                </div>

                <div>
                  <Label for='to'>To</Label>
                  <Input
                    type='date'
                    id='to'
                    bsSize='sm'
                    value={draft.to ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                  />
                </div>

                <Btn attrBtn={{ color: 'primary', size: 'sm', type: 'submit' }}>
                  Apply
                </Btn>
                <Btn
                  attrBtn={{
                    color: 'light',
                    size: 'sm',
                    type: 'button',
                    onClick: reset,
                  }}>
                  Last 30 days
                </Btn>
              </div>
              <span className='f-light f-12 mt-2'>
                Both dates are included in the range.
              </span>
            </Form>

            {render(range)}
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default ReportPage;

// Dashboard and summary (PDF 6.2) — /admin/dashboard/summary on the API.
//
// On Cuba's default-dashboard widgets (4.8.26 — src/Components/Dashboard/
// Default/WidgetsWraper.jsx and src/Components/Common/CommonWidgets/
// Widgets1.jsx for the count cards, LightCardBox.jsx for the small boxes).
// Classes, icons and structure are Cuba's.
//
// Two of Cuba's widget elements are deliberately dropped rather than filled:
// the `gros` percentage-change line and the per-widget "Daily / Weekly"
// dropdown. There is no period-over-period figure in the API and nothing to
// put in the dropdown, and inventing either would be inventing data.
//
// **The day is today, with a date selector** — client instruction,
// 11 Nov 2026. Customer and instructor counts are platform totals and do not
// move with it; bookings, sessions and payments do. Statuses are the six main
// ones, also per that instruction — the API rolls the three cancellation and
// two no-show variants up.
//
// Every tile is a link into the menu that owns those rows, which is 6.2's
// "selecting a dashboard item opens the relevant management section".

import { Fragment, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, Container, Input, Row } from 'reactstrap';
import { Breadcrumbs, H4, H5, H6 } from '../../../AbstractElements';
import SvgIcon from '../../Common/Component/SvgIcon';
import {
  dashboardApi,
  type DashboardSummary,
} from '../../../Services/dashboard.api';

/** Local calendar day, not UTC — the API reads the date the same way. */
const todayValue = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const money = (value: string | number) => `₹${Number(value).toFixed(2)}`;

interface TileProps {
  title: string;
  total: string | number;
  color: string;
  icon: string;
  to: string;
  hint?: string;
}

/** Cuba's Widgets1 card, minus the growth line it has no figure for. */
const Tile = ({ title, total, color, icon, to, hint }: TileProps) => (
  <Link to={to}>
    <Card className='widget-1'>
      <CardBody>
        <div className='widget-content'>
          <div className={`widget-round ${color}`}>
            <div className='bg-round'>
              <SvgIcon className='svg-fill' iconId={icon} />
              <SvgIcon className='half-circle svg-fill' iconId='halfcircle' />
            </div>
          </div>
          <div>
            <H4>{total}</H4>
            <span className='f-light'>{title}</span>
          </div>
        </div>
        {hint ? <div className='f-light f-12'>{hint}</div> : null}
      </CardBody>
    </Card>
  </Link>
);

/** Cuba's LightCardBox, minus its dropdown. */
const CountBox = ({
  title,
  value,
  icon,
  to,
}: {
  title: string;
  value: string | number;
  icon: string;
  to: string;
}) => (
  <Col xs='6' md='4' xxl='2' className='mb-3'>
    <Link to={to}>
      <div className='light-card balance-card widget-hover'>
        <div className='svg-box'>
          <SvgIcon className='svg-fill' iconId={icon} />
        </div>
        <div>
          <span className='f-light'>{title}</span>
          <H6 attrH6={{ className: 'mt-1 mb-0' }}>{value}</H6>
        </div>
      </div>
    </Link>
  </Col>
);

const Dashboard = () => {
  const { layout } = useParams<{ layout: string }>();
  // Links carry the layout segment the sidebar uses, so a tile keeps the
  // layout the admin is on; 'Dubai' is Cuba's own default (Data/Layouts.ts).
  const suffix = `/${layout ?? localStorage.getItem('layout') ?? 'Dubai'}`;

  const [date, setDate] = useState(todayValue());
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      const result = await dashboardApi.summary(date, signal);
      if (signal?.aborted) return;
      if (result.ok) {
        setSummary(result.data);
        setError(null);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    },
    [date],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const customers = summary?.customers;
  const instructors = summary?.instructors;
  const sessions = summary?.sessions.byStatus;
  const payments = summary?.payments;
  const dash = (value: number | undefined) => (value === undefined ? '—' : value);

  return (
    <Fragment>
      <Breadcrumbs mainTitle='Dashboard' parent='HelloFit' title='Dashboard' />
      <Container fluid={true}>
        {error ? (
          <Row>
            <Col sm='12'>
              <Card>
                <CardBody className='txt-danger'>{error}</CardBody>
              </Card>
            </Col>
          </Row>
        ) : null}

        {/* Platform totals — 6.2's first three bullets. Not date-filtered. */}
        <Row className='widget-grid'>
          <Col xl='3' sm='6' className='box-col-6'>
            <Tile
              title='Total customers'
              total={dash(customers?.total)}
              hint={
                customers
                  ? `${customers.active} active · ${customers.blocked} blocked`
                  : undefined
              }
              color='primary'
              icon='customers'
              to={`/management/customers${suffix}`}
            />
          </Col>
          <Col xl='3' sm='6' className='box-col-6'>
            <Tile
              title='Total trainers'
              total={dash(instructors?.total)}
              hint={
                instructors
                  ? `${instructors.active} active · ${instructors.suspended} suspended`
                  : undefined
              }
              color='secondary'
              icon='user-visitor'
              to={`/management/instructors${suffix}`}
            />
          </Col>
          <Col xl='3' sm='6' className='box-col-6'>
            <Tile
              title='Pending applications'
              total={dash(instructors?.pendingApplications)}
              hint={
                instructors ? `${instructors.kycPending} KYC awaiting review` : undefined
              }
              color='warning'
              icon='profile-check'
              to={`/management/instructors${suffix}`}
            />
          </Col>
          <Col xl='3' sm='6' className='box-col-6'>
            <Tile
              title='Payments captured'
              total={payments ? money(payments.CAPTURED.amount) : '—'}
              hint={
                payments
                  ? `${payments.CAPTURED.count} on this day · ${payments.FAILED.count} failed`
                  : undefined
              }
              color='success'
              icon='income'
              to={`/management/payments${suffix}`}
            />
          </Col>
        </Row>

        {/* The day: bookings raised, sessions scheduled, money moved. */}
        <Row>
          <Col sm='12'>
            <Card>
              <CardHeader className='card-no-border'>
                <div className='header-top'>
                  <H5>
                    {loading
                      ? 'Loading…'
                      : `Bookings and sessions · ${summary?.date ?? date}`}
                  </H5>
                  <Input
                    type='date'
                    value={date}
                    style={{ width: 'auto' }}
                    onChange={(e) => setDate(e.target.value || todayValue())}
                  />
                </div>
              </CardHeader>
              <CardBody className='pt-0'>
                <Row>
                  <CountBox
                    title='Bookings raised'
                    value={dash(summary?.bookings.total)}
                    icon='cart'
                    to={`/management/bookings${suffix}`}
                  />
                  <CountBox
                    title='Paid'
                    value={dash(summary?.bookings.byPaymentStatus.PAID)}
                    icon='doller-return'
                    to={`/management/bookings${suffix}`}
                  />
                  <CountBox
                    title='Unpaid'
                    value={dash(summary?.bookings.byPaymentStatus.UNPAID)}
                    icon='expense'
                    to={`/management/bookings${suffix}`}
                  />
                  <CountBox
                    title='Refunded'
                    value={dash(summary?.bookings.byPaymentStatus.REFUNDED)}
                    icon='return-box'
                    to={`/management/payments${suffix}`}
                  />
                  <CountBox
                    title='Sessions scheduled'
                    value={dash(summary?.sessions.total)}
                    icon='orders'
                    to={`/management/bookings${suffix}`}
                  />
                  <CountBox
                    title='Transactions'
                    value={
                      payments
                        ? Object.values(payments).reduce((a, p) => a + p.count, 0)
                        : '—'
                    }
                    icon='new-order'
                    to={`/management/payments${suffix}`}
                  />
                </Row>

                <Row>
                  <CountBox
                    title='Confirmed'
                    value={dash(sessions?.confirmed)}
                    icon='clock'
                    to={`/management/bookings${suffix}`}
                  />
                  <CountBox
                    title='Assigned'
                    value={dash(sessions?.assigned)}
                    icon='profile-check'
                    to={`/management/bookings${suffix}`}
                  />
                  <CountBox
                    title='In progress'
                    value={dash(sessions?.inProgress)}
                    icon='24-hour'
                    to={`/management/bookings${suffix}`}
                  />
                  <CountBox
                    title='Completed'
                    value={dash(sessions?.completed)}
                    icon='rate'
                    to={`/management/bookings${suffix}`}
                  />
                  <CountBox
                    title='Cancelled'
                    value={dash(sessions?.cancelled)}
                    icon='bin'
                    to={`/management/bookings${suffix}`}
                  />
                  <CountBox
                    title='No-show'
                    value={dash(sessions?.noShow)}
                    icon='expense'
                    to={`/management/bookings${suffix}`}
                  />
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Dashboard;

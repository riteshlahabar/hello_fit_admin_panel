// Cuba's sample-page layout (4.8.26 -- src/Components/Pages/PageLayout/SimplePage.jsx):
// Breadcrumbs + a single Card with a CardHeader and CardBody. Structure,
// components and classes are Cuba's, unchanged.
//
// Deliberately not a real dashboard yet. Cuba's template ships five dashboard
// designs, and picking widgets for this one means deciding what ops needs to
// see first -- which is a product decision, and for the two biggest panels
// (the allocation queue and catalog) it is blocked on the unresolved
// marketplace-vs-single-institute question. See state/open-points.md.

import { Fragment, useContext } from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import { Breadcrumbs, H5, P } from '../../../AbstractElements';
import AuthContext from '../../../_helper/Auth';

const Dashboard = () => {
  const { admin } = useContext(AuthContext);

  return (
    <Fragment>
      <Breadcrumbs mainTitle='Dashboard' parent='HelloFit' title='Dashboard' />
      <Container fluid={true}>
        <Row>
          <Col sm='12'>
            <Card>
              <CardHeader>
                <H5>Signed in</H5>
                <span>
                  The Cuba shell is running against the HelloFit API.
                </span>
              </CardHeader>
              <CardBody>
                <P>
                  Role: <strong>{admin?.role}</strong> &middot;{' '}
                  {admin?.permissions.length ?? 0} permissions on this token.
                </P>
                <P>
                  Screens are added one at a time, each converted from Cuba's
                  template and wired to endpoints that already exist. The
                  backend currently serves 110 routes.
                </P>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Dashboard;

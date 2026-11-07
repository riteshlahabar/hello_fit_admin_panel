// Ported from Cuba 4.8.26 -- src/Layout/Footer/index.jsx.
// Markup and classes are Cuba's; only the copyright line names this project
// rather than the template, which is the one edit the theme licence expects.

import { Fragment } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { P } from '../../AbstractElements';

const Footer = () => {
  return (
    <Fragment>
      <footer className='footer'>
        <Container fluid={true}>
          <Row>
            <Col md='12' className='footer-copyright text-center'>
              <P attrPara={{ className: 'mb-0' }}>
                {'Copyright 2026 © HelloFit. Admin theme by Pixelstrap (Cuba).'}
              </P>
            </Col>
          </Row>
        </Container>
      </footer>
    </Fragment>
  );
};

export default Footer;

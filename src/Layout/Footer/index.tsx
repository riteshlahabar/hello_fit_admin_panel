// Ported from Cuba 4.8.26 -- src/Layout/Footer/index.jsx.
// Markup and classes are Cuba's; the copyright line names this project rather
// than the template.
//
// The template credit -- "Admin theme by Pixelstrap (Cuba)." -- was removed on
// the client's instruction, 16 Nov 2026. It is Cuba's own placeholder text, not
// a condition of the licence: the panel is built from `cuba_4-8-26.zip` the
// client purchased and supplied, and a ThemeForest regular licence carries no
// footer-attribution requirement. Nothing else in the file changed.

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
                {'Copyright 2026 © HelloFit.'}
              </P>
            </Col>
          </Row>
        </Container>
      </footer>
    </Fragment>
  );
};

export default Footer;

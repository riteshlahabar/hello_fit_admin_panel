// Ported from Cuba 4.8.26 -- src/CommonElements/Breadcrumbs/index.jsx.
// Props arrive under Cuba's `attr*` convention; see ../index.ts.

import { Fragment, useContext } from 'react';
import type { ReactNode } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import H3 from '../Headings/H3Element';
import CustomizerContext from '../../_helper/Customizer';
import SvgIcon from '../../Components/Common/Component/SvgIcon';
import { PUBLIC_URL } from '../../Config/base';

interface BreadcrumbsProps {
  mainTitle?: ReactNode;
  parent?: ReactNode;
  subParent?: ReactNode;
  title?: ReactNode;
}

const Breadcrumbs = (props: BreadcrumbsProps) => {
  const { layoutURL } = useContext(CustomizerContext);
  return (
    <Fragment>
      <Container fluid={true}>
        <div className='page-title'>
          <Row>
            <Col xs='6'>
              <H3>{props.mainTitle}</H3>
            </Col>
            <Col xs='6'>
              <ol className='breadcrumb'>
                <li className='breadcrumb-item'>
                  <Link to={`${PUBLIC_URL}/dashboard/${layoutURL}`}>
                    <SvgIcon iconId='stroke-home' />
                  </Link>
                </li>
                <li className='breadcrumb-item'>{props.parent}</li>
                {props.subParent ? (
                  <li className='breadcrumb-item'>{props.subParent}</li>
                ) : (
                  ''
                )}
                <li className='breadcrumb-item active'>{props.title}</li>
              </ol>
            </Col>
          </Row>
        </div>
      </Container>
    </Fragment>
  );
};

export default Breadcrumbs;

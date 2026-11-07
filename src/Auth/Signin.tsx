// Cuba's login screen, wired to POST /admin/auth/login.
//
// Markup, classes and the show/hide password control are taken from Cuba
// 4.8.26 -- src/Components/Pages/Auth/LoginForm.jsx. The `.login-card`
// background image is Cuba's own, referenced by pages/_login.scss.
//
// Left out of Cuba's form, both demo-only:
//  - the LinkedIn / Twitter / Facebook buttons, which are plain links to those
//    sites' own login pages and no kind of social sign-in;
//  - "Don't have account? Create Account". There is no admin self-signup --
//    AdminUser rows are created by another admin, and the seed makes the first
//    one. Admin-user CRUD is still a backend gap.
//
// Cuba's tabbed Signin.jsx (simpleLogin / jwt / auth0) collapses to one form,
// because the panel has exactly one way in.

import { Fragment, useContext, useState } from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { Btn, H4, P, Image } from '../AbstractElements';
import AuthContext from '../_helper/Auth';
import logoWhite from '../assets/images/logo/logo.png';
import logoDark from '../assets/images/logo/logo_dark.png';
import { PUBLIC_URL } from '../Config/base';

const Signin = () => {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, ready } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [togglePassword, setTogglePassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (ready && isAuthenticated) {
    return <Navigate to={'/'} replace />;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.ok) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <Fragment>
      <div className='login-card'>
        <div>
          <div>
            <a className='logo' href={PUBLIC_URL || '/'}>
              <Image
                attrImage={{
                  className: 'img-fluid for-light',
                  src: logoWhite,
                  alt: 'login page',
                }}
              />
              <Image
                attrImage={{
                  className: 'img-fluid for-dark',
                  src: logoDark,
                  alt: 'login page',
                }}
              />
            </a>
          </div>

          <div className='login-main'>
            <Form className='theme-form login-form' onSubmit={onSubmit}>
              <H4>Sign in to account</H4>
              <P>Enter your email &amp; password to login</P>

              {error ? (
                <div className='alert alert-danger' role='alert'>
                  {error}
                </div>
              ) : null}

              <FormGroup>
                <Label className='col-form-label m-0'>Email Address</Label>
                <Input
                  className='form-control'
                  type='email'
                  required
                  autoComplete='username'
                  placeholder='admin@hellofit.local'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormGroup>
              <FormGroup className='position-relative'>
                <Label className='col-form-label m-0'>Password</Label>
                <div className='position-relative'>
                  <Input
                    className='form-control'
                    type={togglePassword ? 'text' : 'password'}
                    name='login[password]'
                    required
                    autoComplete='current-password'
                    placeholder='*********'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div
                    className='show-hide'
                    onClick={() => setTogglePassword(!togglePassword)}>
                    <span className={togglePassword ? '' : 'show'}></span>
                  </div>
                </div>
              </FormGroup>
              <FormGroup>
                <Btn
                  attrBtn={{
                    className: 'd-block w-100 mt-2',
                    color: 'primary',
                    type: 'submit',
                    disabled: submitting,
                  }}>
                  {submitting ? 'Signing in...' : 'Sign in'}
                </Btn>
              </FormGroup>
            </Form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Signin;

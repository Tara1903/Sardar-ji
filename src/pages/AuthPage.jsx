import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Clock3, MailCheck, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { BrandLockup } from '../components/brand/BrandLockup';
import { OtpCodeInput } from '../components/auth/OtpCodeInput';
import { useAuth } from '../contexts/AuthContext';
import { useCountdown } from '../hooks/useCountdown';
import { formatOtpDuration, getOtpRequestState } from '../utils/otpState';
import { getFallbackRoute, normalizePanel } from '../utils/panelLinks';
import {
  isStrongPassword,
  isValidEmail,
  isValidPhoneNumber,
  normalizeEmail,
} from '../utils/validation';

const emptyRegisterState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  referralCode: '',
  otp: '',
};

const emptyCustomerLoginChallenge = {
  email: '',
  pendingSession: null,
  expiresAt: '',
  cooldownEndsAt: '',
};

export const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const requestedPanel = normalizePanel(searchParams.get('panel'));
  const isRoleSpecificLogin = requestedPanel === 'admin' || requestedPanel === 'delivery';
  const { acceptAuthSession, authenticateCredentials } = useAuth();
  const [mode, setMode] = useState('login');
  const [formState, setFormState] = useState(emptyRegisterState);
  const [customerLoginChallenge, setCustomerLoginChallenge] = useState(emptyCustomerLoginChallenge);
  const [loginOtp, setLoginOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState('');
  const [cooldownEndsAt, setCooldownEndsAt] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const actionLockRef = useRef(false);

  const isCustomerLoginOtpStage = mode === 'login' && Boolean(customerLoginChallenge.pendingSession);
  const isOtpStage = mode === 'register' && Boolean(otpExpiresAt);
  const loginOtpSecondsRemaining = useCountdown(customerLoginChallenge.expiresAt);
  const loginResendSecondsRemaining = useCountdown(customerLoginChallenge.cooldownEndsAt);
  const otpSecondsRemaining = useCountdown(otpExpiresAt);
  const resendSecondsRemaining = useCountdown(cooldownEndsAt);
  const hasCustomerLoginOtpExpired =
    Boolean(customerLoginChallenge.expiresAt) && loginOtpSecondsRemaining <= 0;
  const hasOtpExpired = Boolean(otpExpiresAt) && otpSecondsRemaining <= 0;

  useEffect(() => {
    if (isRoleSpecificLogin) {
      setMode('login');
    }
  }, [isRoleSpecificLogin]);

  const heading = useMemo(() => {
    if (isCustomerLoginOtpStage) {
      return 'Verify your customer login';
    }

    if (requestedPanel === 'admin') {
      return 'Login to the admin panel';
    }

    if (requestedPanel === 'delivery') {
      return 'Login to the delivery panel';
    }

    if (mode === 'login') {
      return 'Login to continue ordering';
    }

    if (isOtpStage) {
      return 'Verify your account and start ordering';
    }

    return 'Create your customer account';
  }, [isCustomerLoginOtpStage, isOtpStage, mode]);

  const introCopy = useMemo(() => {
    if (isCustomerLoginOtpStage) {
      return 'Tap Send login code once, check your inbox, and finish signing in. Admin and delivery accounts continue after password login without this extra step.';
    }

    if (requestedPanel === 'admin') {
      return 'Use your admin credentials to manage products, orders, customers, and storefront settings.';
    }

    if (requestedPanel === 'delivery') {
      return 'Use your delivery partner credentials to view assigned orders, update status, and share live location.';
    }

    if (mode === 'login') {
      return 'Log in to your customer, admin, or delivery account and pick up right where you left off.';
    }

    return 'Create an account once, save addresses, and move through checkout faster on your next order.';
  }, [isCustomerLoginOtpStage, mode]);

  const resetMessages = () => {
    setError('');
    setInfo('');
  };

  const resetCustomerLoginStage = () => {
    setCustomerLoginChallenge(emptyCustomerLoginChallenge);
    setLoginOtp('');
  };

  const resetRegistrationStage = () => {
    setOtpExpiresAt('');
    setCooldownEndsAt('');
    setFormState((current) => ({ ...current, otp: '' }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetMessages();
    resetCustomerLoginStage();

    if (nextMode === 'login') {
      resetRegistrationStage();
      setFormState((current) => ({
        ...current,
        otp: '',
        confirmPassword: '',
      }));
      return;
    }

    setFormState((current) => ({
      ...current,
      otp: '',
    }));
  };

  const validateRegistration = () => {
    if (!formState.name.trim()) {
      return 'Enter your full name.';
    }

    if (!isValidPhoneNumber(formState.phoneNumber)) {
      return 'Enter a valid 10-digit phone number.';
    }

    if (!isValidEmail(formState.email)) {
      return 'Enter a valid email address.';
    }

    if (!isStrongPassword(formState.password)) {
      return 'Use a stronger password with at least 8 characters and 1 number.';
    }

    if (formState.password !== formState.confirmPassword) {
      return 'Passwords do not match.';
    }

    return '';
  };

  const handleLogin = async () => {
    const normalizedEmail = normalizeEmail(formState.email);

    if (!isValidEmail(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!formState.password) {
      setError('Enter your password to continue.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await authenticateCredentials({
        email: normalizedEmail,
        password: formState.password,
      });

      if (requestedPanel && response.user.role !== requestedPanel) {
        const panelLabel =
          requestedPanel === 'admin'
            ? 'admin'
            : requestedPanel === 'delivery'
              ? 'delivery partner'
              : 'customer';
        setError(`This email does not have ${panelLabel} access. Use the correct panel link instead.`);
        return;
      }

      if (response.user.role !== 'customer') {
        const user = acceptAuthSession(response);
        navigate(redirectPath || getFallbackRoute(user));
        return;
      }

      const existingLoginOtp = getOtpRequestState('login', response.user.email);
      setCustomerLoginChallenge({
        email: response.user.email,
        pendingSession: response,
        expiresAt: existingLoginOtp?.expiresAt || '',
        cooldownEndsAt: existingLoginOtp?.cooldownEndsAt || '',
      });
      setLoginOtp('');
      setInfo(
        existingLoginOtp
          ? `A valid login code is already active for ${response.user.email}.`
          : 'Password confirmed. Tap Send login code once to finish signing in.',
      );
      setError('');
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCustomerLoginOtp = async () => {
    if (!customerLoginChallenge.email) {
      return;
    }

    if (loginResendSecondsRemaining > 0) {
      setInfo(`Please wait ${formatOtpDuration(loginResendSecondsRemaining)} before requesting another code.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.requestLoginOtp({
        email: customerLoginChallenge.email,
      });
      setCustomerLoginChallenge((current) => ({
        ...current,
        expiresAt: response.expiresAt,
        cooldownEndsAt: response.cooldownEndsAt,
      }));
      setInfo(response.message);
      setError('');
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCustomerLogin = async () => {
    if (hasCustomerLoginOtpExpired) {
      setError('Your login code expired. Send a new code to continue.');
      return;
    }

    if (String(loginOtp || '').trim().length < 6) {
      setError('Enter the full verification code from your email.');
      return;
    }

    if (!customerLoginChallenge.pendingSession) {
      setError('Start the login again to continue.');
      return;
    }

    setSubmitting(true);
    try {
      await api.verifyLoginOtp({
        email: customerLoginChallenge.email,
        otp: loginOtp,
      });
      const user = acceptAuthSession(customerLoginChallenge.pendingSession);
      resetCustomerLoginStage();
      navigate(redirectPath || getFallbackRoute(user));
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    const validationError = validateRegistration();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.requestRegistrationOtp({
        ...formState,
        email: normalizeEmail(formState.email),
      });
      setOtpExpiresAt(response.expiresAt);
      setCooldownEndsAt(response.cooldownEndsAt);
      setInfo(response.message);
      setError('');
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendSecondsRemaining > 0) {
      setInfo(`Please wait ${formatOtpDuration(resendSecondsRemaining)} before requesting another code.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.resendRegistrationOtp({
        email: normalizeEmail(formState.email),
      });
      setOtpExpiresAt(response.expiresAt);
      setCooldownEndsAt(response.cooldownEndsAt);
      setFormState((current) => ({ ...current, otp: '' }));
      setInfo(response.message);
      setError('');
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyRegistration = async () => {
    if (hasOtpExpired) {
      setError('Your verification code expired. Send a new code to continue.');
      return;
    }

    if (String(formState.otp || '').trim().length < 6) {
      setError('Enter the full verification code from your email.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.verifyRegistrationOtp({
        ...formState,
        email: normalizeEmail(formState.email),
      });
      const user = acceptAuthSession(response);

      navigate(redirectPath || getFallbackRoute(user));
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (actionLockRef.current) {
      return;
    }

    actionLockRef.current = true;
    resetMessages();

    try {
      if (mode === 'login') {
        if (isCustomerLoginOtpStage) {
          if (!customerLoginChallenge.expiresAt || hasCustomerLoginOtpExpired) {
            await handleSendCustomerLoginOtp();
            return;
          }

          await handleVerifyCustomerLogin();
          return;
        }

        await handleLogin();
        return;
      }

      if (!isOtpStage || hasOtpExpired) {
        if (hasOtpExpired && isOtpStage) {
          await handleResendOtp();
          return;
        }

        await handleSendOtp();
        return;
      }

      await handleVerifyRegistration();
    } finally {
      actionLockRef.current = false;
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <Link className="text-link" to="/">
          <ArrowLeft size={16} />
          Back home
        </Link>

        <BrandLockup className="auth-brand" linkTo="/" />

        <p className="eyebrow">Secure access</p>
        <h1>{heading}</h1>
        <p className="auth-intro-copy">{introCopy}</p>

        {!isRoleSpecificLogin ? (
          <div className="tab-switch">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')} type="button">
              Login
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
              type="button"
            >
              Register
            </button>
          </div>
        ) : (
          <div className="helper-note auth-panel-note">
            <ShieldCheck size={16} />
            <span>
              {requestedPanel === 'admin'
                ? 'Admin sign-in uses password only.'
                : 'Delivery partner sign-in uses password only.'}
            </span>
          </div>
        )}

        {!isCustomerLoginOtpStage ? (
          <div className="form-grid">
            {mode === 'register' ? (
              <>
                <label>
                  Full name
                  <input
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, name: event.target.value }))
                    }
                    value={formState.name}
                  />
                </label>
                <label>
                  Phone number
                  <input
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        phoneNumber: event.target.value,
                      }))
                    }
                    placeholder="For delivery updates and WhatsApp fallback"
                    value={formState.phoneNumber}
                  />
                </label>
              </>
            ) : null}
            <label className="full-width">
              Email
              <input
                onChange={(event) =>
                  setFormState((current) => ({ ...current, email: event.target.value }))
                }
                type="email"
                value={formState.email}
              />
            </label>
            <label className={mode === 'register' ? '' : 'full-width'}>
              Password
              <input
                onChange={(event) =>
                  setFormState((current) => ({ ...current, password: event.target.value }))
                }
                type="password"
                value={formState.password}
              />
            </label>
            {mode === 'register' ? (
              <label>
                Confirm password
                <input
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  type="password"
                  value={formState.confirmPassword}
                />
              </label>
            ) : null}
            {mode === 'register' ? (
              <label className="full-width">
                Referral code
                <input
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      referralCode: event.target.value,
                    }))
                  }
                  placeholder="Optional referral code"
                  value={formState.referralCode}
                />
              </label>
            ) : null}
          </div>
        ) : null}

        {isCustomerLoginOtpStage ? (
          <div className="otp-panel">
            <div className="space-between">
              <div>
                <p className="eyebrow">Customer login verification</p>
                <h3>Enter the 6-digit code from your email</h3>
              </div>
              <MailCheck size={18} />
            </div>

            <p>
              We sent a one-time login code to <strong>{customerLoginChallenge.email}</strong>.
              Customer accounts need this extra step before checkout, while admin and delivery
              accounts continue directly after password login.
            </p>

            <OtpCodeInput autoFocus disabled={submitting} onChange={setLoginOtp} value={loginOtp} />

            <div className="otp-status-row">
              <span>
                <Clock3 size={15} />
                {hasCustomerLoginOtpExpired
                  ? 'Code expired'
                  : customerLoginChallenge.expiresAt
                    ? `Expires in ${formatOtpDuration(loginOtpSecondsRemaining)}`
                    : 'Send a login code to continue'}
              </span>
              <button
                className="text-button"
                disabled={submitting || loginResendSecondsRemaining > 0}
                onClick={handleSendCustomerLoginOtp}
                type="button"
              >
                {loginResendSecondsRemaining > 0
                  ? `Resend in ${formatOtpDuration(loginResendSecondsRemaining)}`
                  : customerLoginChallenge.expiresAt
                    ? 'Send new code'
                    : 'Send login code'}
              </button>
            </div>

            <div className="helper-note">
              <ShieldCheck size={16} />
              <span>Use a different account if you entered the wrong customer email or password.</span>
            </div>

            <button
              className="text-button"
              onClick={() => {
                resetCustomerLoginStage();
                resetMessages();
              }}
              type="button"
            >
              Use different account
            </button>
          </div>
        ) : null}

        {mode === 'register' ? (
          <div className="otp-panel">
            <div className="space-between">
              <div>
                <p className="eyebrow">Verification code</p>
                <h3>Secure your account before first order</h3>
              </div>
              <MailCheck size={18} />
            </div>

            <p>
              This deployment currently sends the verification code to{' '}
              <strong>{normalizeEmail(formState.email) || 'your email'}</strong>. Your phone number is saved for delivery calls and WhatsApp fallback.
            </p>

            {isOtpStage ? (
              <>
                <OtpCodeInput
                  autoFocus
                  disabled={submitting}
                  onChange={(nextValue) =>
                    setFormState((current) => ({ ...current, otp: nextValue }))
                  }
                  value={formState.otp}
                />
                <div className="otp-status-row">
                  <span>
                    <Clock3 size={15} />
                    {hasOtpExpired
                      ? 'Code expired'
                      : `Expires in ${formatOtpDuration(otpSecondsRemaining)}`}
                  </span>
                  <button
                    className="text-button"
                    disabled={submitting || resendSecondsRemaining > 0}
                    onClick={handleResendOtp}
                    type="button"
                  >
                    {resendSecondsRemaining > 0
                      ? `Resend in ${formatOtpDuration(resendSecondsRemaining)}`
                      : 'Resend code'}
                  </button>
                </div>
              </>
            ) : (
              <div className="helper-note">
                <ShieldCheck size={16} />
                <span>One code, one device, and a 5-minute validity window for safer signups.</span>
              </div>
            )}
          </div>
        ) : null}

        {info ? <p className="success-text">{info}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <button
          className="btn btn-primary full-width"
          disabled={submitting}
          onClick={handlePrimaryAction}
          type="button"
        >
          {submitting
            ? 'Please wait...'
            : mode === 'login'
              ? isCustomerLoginOtpStage
                ? !customerLoginChallenge.expiresAt
                  ? 'Send login code'
                  : hasCustomerLoginOtpExpired
                    ? 'Send new login code'
                    : 'Verify and continue'
                : 'Login'
              : isOtpStage && !hasOtpExpired
                ? 'Verify and create account'
                : 'Send verification code'}
        </button>
      </div>
    </section>
  );
};

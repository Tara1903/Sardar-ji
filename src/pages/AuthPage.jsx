import { useMemo, useState } from 'react';
import { ArrowLeft, MailCheck, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { BrandLockup } from '../components/brand/BrandLockup';
import { useAuth } from '../contexts/AuthContext';
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

const getFallbackRoute = (user) =>
  user.role === 'admin' ? '/admin/dashboard' : user.role === 'delivery' ? '/delivery' : '/';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [formState, setFormState] = useState(emptyRegisterState);
  const [otpExpiresAt, setOtpExpiresAt] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOtpStage = mode === 'register' && Boolean(otpExpiresAt);
  const hasOtpExpired =
    Boolean(otpExpiresAt) && new Date(otpExpiresAt).getTime() <= Date.now();

  const heading = useMemo(() => {
    if (mode === 'login') {
      return 'Login to continue ordering';
    }

    if (isOtpStage) {
      return 'Verify your email to finish account setup';
    }

    return 'Create your customer account';
  }, [isOtpStage, mode]);

  const resetMessages = () => {
    setError('');
    setInfo('');
  };

  const resetRegistrationStage = () => {
    setOtpExpiresAt('');
    setFormState((current) => ({ ...current, otp: '' }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetMessages();

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
    if (!isValidEmail(formState.email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!formState.password) {
      setError('Enter your password to continue.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login({
        email: normalizeEmail(formState.email),
        password: formState.password,
      });

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
      setInfo(`Verification code sent to ${response.email}. It expires in 5 minutes.`);
      setError('');
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setSubmitting(true);
    try {
      const response = await api.requestOrderOtp({
        email: normalizeEmail(formState.email),
      });
      setOtpExpiresAt(response.expiresAt);
      setFormState((current) => ({ ...current, otp: '' }));
      setInfo(`A fresh verification code was sent to ${response.email}. It expires in 5 minutes.`);
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

    if (!formState.otp.trim()) {
      setError('Enter the code sent to your email.');
      return;
    }

    setSubmitting(true);
    try {
      await api.verifyRegistrationOtp({
        ...formState,
        email: normalizeEmail(formState.email),
      });
      const user = await login({
        email: normalizeEmail(formState.email),
        password: formState.password,
      });

      navigate(redirectPath || getFallbackRoute(user));
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimaryAction = async () => {
    resetMessages();

    if (mode === 'login') {
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
        <p>Customer, admin, and delivery access stay protected, but no credentials are exposed in the interface.</p>

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

        {mode === 'register' ? (
          <div className="otp-panel">
            <div className="space-between">
              <div>
                <p className="eyebrow">Email OTP</p>
                <h3>Verify your email before first login</h3>
              </div>
              <MailCheck size={18} />
            </div>

            <p>
              We send a verification code to your email. The code stays valid for 5 minutes.
            </p>

            {isOtpStage ? (
              <div className="otp-grid">
                <label className="full-width">
                  Verification code
                  <input
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, otp: event.target.value }))
                    }
                    placeholder="Enter the code from your email"
                    value={formState.otp}
                  />
                </label>
                <button
                  className="btn btn-secondary"
                  disabled={submitting}
                  onClick={() => {
                    resetMessages();
                    handleResendOtp();
                  }}
                  type="button"
                >
                  Send new code
                </button>
              </div>
            ) : (
              <div className="helper-note">
                <ShieldCheck size={16} />
                <span>Use your real email address to receive the OTP.</span>
              </div>
            )}
          </div>
        ) : null}

        {info ? <p className="success-text">{info}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn btn-primary full-width" disabled={submitting} onClick={handlePrimaryAction} type="button">
          {submitting
            ? 'Please wait...'
            : mode === 'login'
              ? 'Login'
              : isOtpStage && !hasOtpExpired
                ? 'Verify and create account'
                : 'Send verification code'}
        </button>
      </div>
    </section>
  );
};

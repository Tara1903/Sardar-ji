import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Clock3, MailCheck, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { BrandLockup } from '../components/brand/BrandLockup';
import { OtpCodeInput } from '../components/auth/OtpCodeInput';
import { OtpSuccessPopup } from '../components/auth/OtpSuccessPopup';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAuth } from '../contexts/AuthContext';
import { useCountdown } from '../hooks/useCountdown';
import {
  BUTTON_PRESS_VARIANTS,
  CONTENT_FADE_VARIANTS,
  CONTENT_STACK_VARIANTS,
  SPRING_SMOOTH,
  SURFACE_REVEAL_VARIANTS,
} from '../motion/variants';
import { formatOtpDuration } from '../utils/otpState';
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

const emptyOtpPopup = {
  open: false,
  title: '',
  message: '',
};

const getFallbackRoute = (user) =>
  user.role === 'admin' ? '/admin/dashboard' : user.role === 'delivery' ? '/delivery' : '/';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { acceptAuthSession, authenticateCredentials } = useAuth();
  const [mode, setMode] = useState('login');
  const [formState, setFormState] = useState(emptyRegisterState);
  const [otpExpiresAt, setOtpExpiresAt] = useState('');
  const [cooldownEndsAt, setCooldownEndsAt] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [otpPopup, setOtpPopup] = useState(emptyOtpPopup);
  const [submitting, setSubmitting] = useState(false);
  const actionLockRef = useRef(false);

  const isOtpStage = mode === 'register' && Boolean(otpExpiresAt);
  const otpSecondsRemaining = useCountdown(otpExpiresAt);
  const resendSecondsRemaining = useCountdown(cooldownEndsAt);
  const hasOtpExpired = Boolean(otpExpiresAt) && otpSecondsRemaining <= 0;

  const heading = useMemo(() => {
    if (mode === 'login') {
      return 'Login to continue ordering';
    }

    if (isOtpStage) {
      return 'Verify your account and start ordering';
    }

    return 'Create your customer account';
  }, [isOtpStage, mode]);

  const introCopy = useMemo(() => {
    if (mode === 'login') {
      return 'Log in to your customer, admin, or delivery account and pick up right where you left off.';
    }

    return 'Create an account once, save addresses, and move through checkout faster on your next order.';
  }, [mode]);

  const resetMessages = () => {
    setError('');
    setInfo('');
  };

  const closeOtpPopup = useCallback(() => {
    setOtpPopup(emptyOtpPopup);
  }, []);

  const showOtpPopup = useCallback((title, message) => {
    setOtpPopup({
      open: true,
      title,
      message,
    });
  }, []);

  useEffect(() => {
    closeOtpPopup();
  }, [closeOtpPopup, mode]);

  const resetRegistrationStage = () => {
    setOtpExpiresAt('');
    setCooldownEndsAt('');
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
      const user = acceptAuthSession(response);
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
      showOtpPopup(response.reused ? 'Code already active' : 'Verification code sent', response.message);
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
      showOtpPopup(response.reused ? 'Code already active' : 'Verification code sent', response.message);
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
      <SeoMeta noIndex path="/auth" title={mode === 'login' ? 'Login' : 'Register'} />
      <OtpSuccessPopup
        message={otpPopup.message}
        onClose={closeOtpPopup}
        open={otpPopup.open}
        title={otpPopup.title}
      />
      <motion.div
        animate="show"
        className="auth-card auth-card-premium"
        initial="hidden"
        variants={SURFACE_REVEAL_VARIANTS}
      >
        <span aria-hidden="true" className="auth-card-orb auth-card-orb-primary" />
        <span aria-hidden="true" className="auth-card-orb auth-card-orb-secondary" />

        <motion.div className="auth-card-header" variants={CONTENT_STACK_VARIANTS}>
          <motion.div variants={CONTENT_FADE_VARIANTS}>
            <Link className="text-link" to="/">
              <ArrowLeft size={16} />
              Back home
            </Link>
          </motion.div>

          <motion.div variants={CONTENT_FADE_VARIANTS}>
            <BrandLockup className="auth-brand" linkTo="/" />
          </motion.div>

          <motion.div className="auth-utility-row" variants={CONTENT_FADE_VARIANTS}>
            <span className="auth-utility-chip">
              <ShieldCheck size={15} />
              Protected login
            </span>
            <span className="auth-utility-chip">
              <Clock3 size={15} />
              Fast checkout later
            </span>
            <span className="auth-utility-chip">
              <MailCheck size={15} />
              Order updates on email
            </span>
          </motion.div>

          <motion.div variants={CONTENT_FADE_VARIANTS}>
            <p className="eyebrow">Secure access</p>
            <h1>{heading}</h1>
            <p className="auth-intro-copy">{introCopy}</p>
          </motion.div>
        </motion.div>

        <motion.div className="tab-switch" variants={CONTENT_FADE_VARIANTS}>
          <motion.button
            animate="rest"
            className={mode === 'login' ? 'active' : ''}
            initial="rest"
            onClick={() => switchMode('login')}
            type="button"
            variants={BUTTON_PRESS_VARIANTS}
            whileHover="hover"
            whileTap="tap"
          >
            Login
          </motion.button>
          <motion.button
            animate="rest"
            className={mode === 'register' ? 'active' : ''}
            initial="rest"
            onClick={() => switchMode('register')}
            type="button"
            variants={BUTTON_PRESS_VARIANTS}
            whileHover="hover"
            whileTap="tap"
          >
            Register
          </motion.button>
        </motion.div>

        <motion.div className="form-grid" variants={CONTENT_FADE_VARIANTS}>
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
        </motion.div>

        <AnimatePresence initial={false}>
          {mode === 'register' ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="otp-panel"
              exit={{ opacity: 0, y: -14 }}
              initial={{ opacity: 0, y: 18 }}
              transition={SPRING_SMOOTH}
            >
              <div className="space-between">
                <div>
                  <p className="eyebrow">Verification code</p>
                  <h3>Secure your account before first order</h3>
                </div>
                <MailCheck size={18} />
              </div>

              <p>
                We will send a 6-digit verification code to{' '}
                <strong>{normalizeEmail(formState.email) || 'your email'}</strong> to secure your new
                account. Your phone number is saved for delivery calls and WhatsApp support.
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
                  <span>Your code stays valid for 5 minutes and helps keep new accounts secure.</span>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {info ? (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="success-text"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 10 }}
            >
              {info}
            </motion.p>
          ) : null}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {error ? (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="error-text"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 10 }}
            >
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <motion.button
          animate="rest"
          className="btn btn-primary full-width"
          disabled={submitting}
          initial="rest"
          onClick={handlePrimaryAction}
          type="button"
          variants={BUTTON_PRESS_VARIANTS}
          whileHover="hover"
          whileTap="tap"
        >
          {submitting
            ? 'Please wait...'
            : mode === 'login'
              ? 'Login'
              : isOtpStage && !hasOtpExpired
                ? 'Verify and create account'
                : 'Send verification code'}
        </motion.button>
      </motion.div>
    </section>
  );
};

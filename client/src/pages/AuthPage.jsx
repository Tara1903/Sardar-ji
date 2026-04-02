import { useMemo, useState } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const demoAccounts = [
  { role: 'Admin', email: 'admin@sardarji.local', password: 'Admin@123' },
  { role: 'Delivery', email: 'delivery@sardarji.local', password: 'Delivery@123' },
  { role: 'Customer', email: 'customer@sardarji.local', password: 'Customer@123' },
];

export const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    referralCode: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const heading = useMemo(
    () => (mode === 'login' ? 'Login to continue ordering' : 'Create your customer account'),
    [mode],
  );

  const completeAuth = async () => {
    setSubmitting(true);
    try {
      const user =
        mode === 'login'
          ? await login({ email: formState.email, password: formState.password })
          : await register({ ...formState, role: 'customer' });

      const fallback = user.role === 'admin' ? '/admin' : user.role === 'delivery' ? '/delivery' : '/';
      navigate(redirectPath || fallback);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <Link className="text-link" to="/">
          <ArrowLeft size={16} />
          Back home
        </Link>
        <p className="eyebrow">Secure access</p>
        <h1>{heading}</h1>
        <p>Customer, admin, and delivery roles are separated with protected routes.</p>

        <div className="tab-switch">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">
            Login
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">
            Register
          </button>
        </div>

        <div className="form-grid">
          {mode === 'register' ? (
            <>
              <label>
                Full name
                <input onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} value={formState.name} />
              </label>
              <label>
                Phone number
                <input onChange={(event) => setFormState((current) => ({ ...current, phoneNumber: event.target.value }))} value={formState.phoneNumber} />
              </label>
            </>
          ) : null}
          <label className="full-width">
            Email
            <input onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} type="email" value={formState.email} />
          </label>
          <label className="full-width">
            Password
            <input onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))} type="password" value={formState.password} />
          </label>
          {mode === 'register' ? (
            <label className="full-width">
              Referral code
              <input onChange={(event) => setFormState((current) => ({ ...current, referralCode: event.target.value }))} placeholder="Optional referral code" value={formState.referralCode} />
            </label>
          ) : null}
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        <button className="btn btn-primary full-width" disabled={submitting} onClick={completeAuth} type="button">
          {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
        </button>

        <div className="demo-box">
          <p className="eyebrow">Demo access</p>
          {demoAccounts.map((account) => (
            <button
              className="demo-account"
              key={account.role}
              onClick={() => {
                setMode('login');
                setFormState((current) => ({
                  ...current,
                  email: account.email,
                  password: account.password,
                }));
              }}
              type="button"
            >
              <ShieldCheck size={16} />
              {account.role}: {account.email}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

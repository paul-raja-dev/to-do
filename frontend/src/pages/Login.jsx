import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const { login, register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const updateField = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setLocalError(null);
    clearError();
  };

  const switchMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setLocalError(null);
    clearError();
    setForm({ username: '', email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Basic validation
    if (!form.email.trim() || !form.password.trim()) {
      setLocalError('Email and password are required.');
      return;
    }
    if (mode === 'register' && !form.username.trim()) {
      setLocalError('Username is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ username: form.username, email: form.email, password: form.password });
      }
      navigate('/');
    } catch {
      // Error is already set in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-white text-black font-mono flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h1 className="text-2xl font-black uppercase tracking-[-0.03em] leading-none">
            TaskFlow
          </h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 mt-1">
            {mode === 'login' ? 'System Login' : 'New Account'}
          </p>
        </div>

        {/* ── MODE TOGGLE ─────────────────────────────────────────────────── */}
        <div className="flex gap-px bg-black border border-black mb-8">
          <button
            type="button"
            onClick={() => mode !== 'login' && switchMode()}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-colors cursor-pointer
              ${mode === 'login' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-800 hover:text-white'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => mode !== 'register' && switchMode()}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-colors cursor-pointer
              ${mode === 'register' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-800 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        {/* ── ERROR BANNER ────────────────────────────────────────────────── */}
        {displayError && (
          <div className="flex items-center gap-4 border px-5 py-3 text-xs font-mono uppercase tracking-widest mb-6 bg-black text-white border-black">
            <span>
              <span className="font-black mr-2">// ERR</span>
              {displayError}
            </span>
          </div>
        )}

        {/* ── FORM ────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>

          {/* Username — register only */}
          {mode === 'register' && (
            <div className="mb-5">
              <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">
                Username *
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={updateField('username')}
                placeholder="Choose a username..."
                className="w-full border-b-2 border-black bg-transparent py-2 text-sm font-bold placeholder:text-neutral-300 focus:outline-none"
              />
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={updateField('email')}
              placeholder="Enter your email..."
              className="w-full border-b-2 border-black bg-transparent py-2 text-sm font-bold placeholder:text-neutral-300 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">
              Password *
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={updateField('password')}
              placeholder="Enter your password..."
              className="w-full border-b-2 border-black bg-transparent py-2 text-sm font-bold placeholder:text-neutral-300 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting
              ? '[ Authenticating... ]'
              : mode === 'login'
                ? '[ Login ]'
                : '[ Create Account ]'
            }
          </button>
        </form>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={switchMode}
            className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors cursor-pointer"
          >
            {mode === 'login'
              ? 'Don\'t have an account? Register →'
              : 'Already have an account? Login →'
            }
          </button>
        </div>

        {/* ── BRANDING ────────────────────────────────────────────────────── */}
        <div className="mt-16 border-t border-neutral-200 pt-4 text-center">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-300">
            TaskFlow · Secure Auth
          </span>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth, AuthUser } from '../context/AuthContext';

interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      login(data.token, data.user);

      if (onSuccess) {
        onSuccess(data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (\n    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm w-full mx-auto" aria-label="Login Form">\n      <h2 className="text-xl font-bold text-slate-800 text-center">Sign In</h2>\n\n      {error && (\n        <div role="alert" className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">\n          {error}\n        </div>\n      )}\n\n      <div>\n        <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">\n          Email Address\n        </label>\n        <input\n          id="login-email"\n          type="email"\n          value={email}\n          onChange={(e) => setEmail(e.target.value)}\n          placeholder="you@example.com"\n          required\n          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"\n        />\n      </div>\n\n      <div>\n        <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">\n          Password\n        </label>\n        <input\n          id="login-password"\n          type="password"\n          value={password}\n          onChange={(e) => setPassword(e.target.value)}\n          placeholder="Your password"\n          required\n          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"\n        />\n      </div>\n\n      <button\n        type="submit"\n        disabled={loading}\n        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"\n      >\n        {loading ? 'Signing in...' : 'Sign In'}\n      </button>\n\n      {onSwitchToRegister && (\n        <p className=\"text-xs text-center text-slate-600 pt-2\">\n          Don't have an account?{' '}\n          <button\n            type=\"button\"\n            onClick={onSwitchToRegister}\n            className=\"text-indigo-600 font-semibold hover:underline\"\n          >\n            Create account\n          </button>\n        </p>\n      )}\n    </form>\n  );\n}

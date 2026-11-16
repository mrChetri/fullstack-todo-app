import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '../context/AuthContext';

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(<AuthProvider>{ui}</AuthProvider>);
  };

  it('renders login form elements properly', () => {
    renderWithAuth(<LoginForm />);

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays error on failed credentials from server', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid email or password' }),
      })
    );

    renderWithAuth(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'WrongPass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('stores token and user in localStorage on successful login', async () => {
    const handleSuccess = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'mock-jwt-token-12345',
          user: { id: 'u1', email: 'user@example.com' },
        }),
      })
    );

    renderWithAuth(<LoginForm onSuccess={handleSuccess} />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await screen.findByRole('button', { name: /sign in/i });

    expect(localStorage.getItem('todo_app_token')).toBe('mock-jwt-token-12345');
    expect(JSON.parse(localStorage.getItem('todo_app_user') || '{}')).toEqual({
      id: 'u1',
      email: 'user@example.com',
    });
    expect(handleSuccess).toHaveBeenCalledWith({ id: 'u1', email: 'user@example.com' });
  });
});

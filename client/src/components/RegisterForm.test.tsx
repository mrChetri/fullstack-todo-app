import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterForm } from './RegisterForm';

describe('RegisterForm Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders form elements properly', () => {
    render(<RegisterForm />);

    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows client validation error when password is too short', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/password must be at least 6 characters/i);
  });

  it('submits registration successfully and calls onSuccess callback', async () => {
    const handleSuccess = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'user-123', email: 'user@example.com' }),
      })
    );

    render(<RegisterForm onSuccess={handleSuccess} />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/account created successfully/i);
    expect(handleSuccess).toHaveBeenCalledWith({ id: 'user-123', email: 'user@example.com' });
  });

  it('displays server error message on duplicate registration failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: 'A user with this email already exists' }),
      })
    );

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'duplicate@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('A user with this email already exists');
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoCreator } from './TodoCreator';
import { AuthProvider } from '../context/AuthContext';

describe('TodoCreator Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem('todo_app_token', 'valid-token');
    localStorage.setItem('todo_app_user', JSON.stringify({ id: 'u1', email: 'user@example.com' }));
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(<AuthProvider>{ui}</AuthProvider>);
  };

  it('renders input field and add button', () => {
    renderWithAuth(<TodoCreator onTodoCreated={vi.fn()} />);

    expect(screen.getByPlaceholderText(/what needs to be done\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('shows validation error when attempting to add empty title', () => {
    renderWithAuth(<TodoCreator onTodoCreated={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/please enter a todo title/i);
  });

  it('submits valid todo, clears input, and calls onTodoCreated', async () => {
    const handleCreated = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'todo-1',
          title: 'Learn TypeScript generics',
          status: 'pending',
          owner: 'u1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      })
    );

    renderWithAuth(<TodoCreator onTodoCreated={handleCreated} />);

    const input = screen.getByPlaceholderText(/what needs to be done\?/i);
    fireEvent.change(input, { target: { value: 'Learn TypeScript generics' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(await screen.findByPlaceholderText(/what needs to be done\?/i)).toHaveValue('');
    expect(handleCreated).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Learn TypeScript generics', status: 'pending' })
    );
  });
});

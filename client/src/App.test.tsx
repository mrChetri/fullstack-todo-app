import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders application header and sign in form by default', () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})));

    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Todo Application');
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows toggling between sign in and create account tabs', () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})));

    render(<App />);

    // Switch to Register tab
    fireEvent.click(screen.getByRole('tab', { name: /create account/i }));
    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();

    // Switch back to Sign in tab
    fireEvent.click(screen.getByRole('tab', { name: /sign in/i }));
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('restores authenticated user session, loads todos, and allows sign out', async () => {
    localStorage.setItem('todo_app_token', 'saved-test-token');
    localStorage.setItem('todo_app_user', JSON.stringify({ id: 'u1', email: 'sessionuser@example.com' }));

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url === '/api/health') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: 'ok', database: { status: 'connected' } }),
          });
        }
        if (url === '/api/todos') {
          return Promise.resolve({
            ok: true,
            json: async () => [
              {\n                id: 't1',\n                title: 'Existing Todo Item',\n                status: 'pending',\n                owner: 'u1',\n                createdAt: '2026-11-16T00:00:00.000Z',\n                updatedAt: '2026-11-16T00:00:00.000Z',\n              },\n            ],\n          });\n        }\n        return Promise.reject(new Error('Unknown url'));\n      })\n    );\n\n    render(<App />);\n\n    expect(await screen.findByText(/account:/i)).toBeInTheDocument();\n    expect(screen.getByText('sessionuser@example.com')).toBeInTheDocument();\n    expect(await screen.findByText('Existing Todo Item')).toBeInTheDocument();\n\n    // Click Sign out button\n    const logoutBtn = screen.getByRole('button', { name: /sign out/i });\n    fireEvent.click(logoutBtn);\n\n    // Expect session to be cleared\n    expect(localStorage.getItem('todo_app_token')).toBeNull();\n    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();\n  });\n\n  it('allows toggling a todo completion status via checkbox and filtering with tabs', async () => {\n    localStorage.setItem('todo_app_token', 'saved-test-token');\n    localStorage.setItem('todo_app_user', JSON.stringify({ id: 'u1', email: 'sessionuser@example.com' }));\n\n    const mockFetch = vi.fn().mockImplementation((url: string, options?: RequestInit) => {\n      if (url === '/api/health') {\n        return Promise.resolve({\n          ok: true,\n          json: async () => ({ status: 'ok', database: { status: 'connected' } }),\n        });\n      }\n      if (url.startsWith('/api/todos') && (!options || options.method === 'GET' || !options.method)) {\n        return Promise.resolve({\n          ok: true,\n          json: async () => [\n            {\n              id: 't1',\n              title: 'Learn Vitest',\n              status: 'pending',\n              owner: 'u1',\n              createdAt: '2026-11-16T00:00:00.000Z',\n              updatedAt: '2026-11-16T00:00:00.000Z',\n            },\n          ],\n        });\n      }\n      if (url === '/api/todos/t1' && options?.method === 'PATCH') {\n        return Promise.resolve({\n          ok: true,\n          json: async () => ({\n            id: 't1',\n            title: 'Learn Vitest',\n            status: 'completed',\n            owner: 'u1',\n            createdAt: '2026-11-16T00:00:00.000Z',\n            updatedAt: '2026-11-16T00:00:00.000Z',\n          }),\n        });\n      }\n      return Promise.reject(new Error('Unknown url'));\n    });\n\n    vi.stubGlobal('fetch', mockFetch);\n\n    render(<App />);\n\n    expect(await screen.findByText('Learn Vitest')).toBeInTheDocument();\n\n    // Checkbox is currently unchecked\n    const checkbox = screen.getByRole('checkbox');\n    expect(checkbox).not.toBeChecked();\n\n    // Toggle completion status\n    await fireEvent.click(checkbox);\n\n    // Expect PATCH request to be issued\n    expect(mockFetch).toHaveBeenCalledWith(\n      '/api/todos/t1',\n      expect.objectContaining({\n        method: 'PATCH',\n        body: JSON.stringify({ status: 'completed' }),\n      })\n    );\n\n    // Filter tabs exist: All, Pending, Completed\n    const allTab = screen.getByRole('tab', { name: /^all$/i });\n    const pendingTab = screen.getByRole('tab', { name: /^pending$/i });\n    const completedTab = screen.getByRole('tab', { name: /^completed$/i });\n\n    expect(allTab).toBeInTheDocument();\n    expect(pendingTab).toBeInTheDocument();\n    expect(completedTab).toBeInTheDocument();\n\n    // Switch to Pending filter tab\n    await fireEvent.click(pendingTab);\n    expect(mockFetch).toHaveBeenCalledWith(\n      '/api/todos?status=pending',\n      expect.anything()\n    );\n  });\n\n  it('allows editing a todo title inline and deleting a todo', async () => {\n    localStorage.setItem('todo_app_token', 'saved-test-token');\n    localStorage.setItem('todo_app_user', JSON.stringify({ id: 'u1', email: 'sessionuser@example.com' }));\n\n    const mockFetch = vi.fn().mockImplementation((url: string, options?: RequestInit) => {\n      if (url === '/api/health') {\n        return Promise.resolve({\n          ok: true,\n          json: async () => ({ status: 'ok', database: { status: 'connected' } }),\n        });\n      }\n      if (url.startsWith('/api/todos') && (!options || options.method === 'GET' || !options.method)) {\n        return Promise.resolve({\n          ok: true,\n          json: async () => [\n            {\n              id: 't1',\n              title: 'Original Title',\n              status: 'pending',\n              owner: 'u1',\n              createdAt: '2026-11-16T00:00:00.000Z',\n              updatedAt: '2026-11-16T00:00:00.000Z',\n            },\n          ],\n        });\n      }\n      if (url === '/api/todos/t1' && options?.method === 'PATCH') {\n        return Promise.resolve({\n          ok: true,\n          json: async () => ({\n            id: 't1',\n            title: 'Edited Title',\n            status: 'pending',\n            owner: 'u1',\n            createdAt: '2026-11-16T00:00:00.000Z',\n            updatedAt: '2026-11-16T00:00:00.000Z',\n          }),\n        });\n      }\n      if (url === '/api/todos/t1' && options?.method === 'DELETE') {\n        return Promise.resolve({\n          ok: true,\n          json: async () => ({ message: 'Todo deleted successfully' }),\n        });\n      }\n      return Promise.reject(new Error('Unknown url'));\n    });\n\n    vi.stubGlobal('fetch', mockFetch);\n\n    render(<App />);\n\n    expect(await screen.findByText('Original Title')).toBeInTheDocument();\n\n    // Click Edit button\n    const editBtn = screen.getByRole('button', { name: /edit \"original title\"/i });\n    await fireEvent.click(editBtn);\n\n    // Change title and click Save\n    const input = screen.getByDisplayValue('Original Title');\n    await fireEvent.change(input, { target: { value: 'Edited Title' } });\n\n    const saveBtn = screen.getByRole('button', { name: /save/i });\n    await fireEvent.click(saveBtn);\n\n    // Verify PATCH was called with title\n    expect(mockFetch).toHaveBeenCalledWith(\n      '/api/todos/t1',\n      expect.objectContaining({\n        method: 'PATCH',\n        body: JSON.stringify({ title: 'Edited Title' }),\n      })\n    );\n\n    // Click Delete button\n    const deleteBtn = screen.getByRole('button', { name: /delete \"edited title\"/i });\n    await fireEvent.click(deleteBtn);\n\n    // Verify DELETE was called\n    expect(mockFetch).toHaveBeenCalledWith(\n      '/api/todos/t1',\n      expect.objectContaining({\n        method: 'DELETE',\n      })\n    );\n\n    // Item is removed from the view\n    expect(screen.queryByText('Edited Title')).not.toBeInTheDocument();\n  });\n});

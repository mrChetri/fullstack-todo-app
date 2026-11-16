import { useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { TodoCreator } from './components/TodoCreator';
import { TodoList } from './components/TodoList';
import { Todo, TodoStatus } from './types/todo';

interface HealthResponse {
  status: string;
  uptime: number;
  timestamp: string;
  database: {
    status: string;
  };
}

function MainContent() {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  // Todo state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [todoError, setTodoError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [togglingTodoId, setTogglingTodoId] = useState<string | null>(null);

  // Healthcheck probe
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json() as Promise<HealthResponse>)
      .then((data) => {
        setHealth(data);
        setHealthLoading(false);
      })
      .catch(() => {
        setHealthLoading(false);
      });
  }, []);

  // Fetch todos when user is authenticated
  const fetchTodos = useCallback(
    async (filter: 'all' | 'pending' | 'completed' = statusFilter) => {
      if (!token) return;
      setTodosLoading(true);
      setTodoError(null);

      try {
        const url = filter === 'all' ? '/api/todos' : `/api/todos?status=${filter}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load todos');
        }

        const data = await response.json();
        setTodos(data);
      } catch (err) {
        setTodoError(err instanceof Error ? err.message : 'Error loading todos');
      } finally {
        setTodosLoading(false);
      }
    },
    [token, statusFilter]
  );

  useEffect(() => {
    if (user && token) {
      fetchTodos();
    } else {
      setTodos([]);
    }
  }, [user, token, fetchTodos]);

  const handleStatusFilterChange = (filter: 'all' | 'pending' | 'completed') => {
    setStatusFilter(filter);
    fetchTodos(filter);
  };

  const handleTodoCreated = (newTodo: Todo) => {
    if (statusFilter === 'all' || statusFilter === newTodo.status) {
      setTodos((prev) => [...prev, newTodo]);
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (!token) return;
    const targetTodo = todos.find((t) => t.id === id);
    if (!targetTodo) return;

    const nextStatus: TodoStatus = targetTodo.status === 'completed' ? 'pending' : 'completed';
    const previousTodos = [...todos];

    // Optimistic update for instant visual feedback
    setTogglingTodoId(id);
    setTodos((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
        .filter((t) => (statusFilter === 'all' ? true : t.status === nextStatus))
    );
    setTodoError(null);

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update todo status');
      }

      const updatedTodo: Todo = await response.json();
      setTodos((prev) =>
        prev
          .map((todo) => (todo.id === id ? updatedTodo : todo))\n          .filter((todo) => (statusFilter === 'all' ? true : todo.status === statusFilter))\n      );\n    } catch (err) {\n      // Revert optimistic update on failure\n      setTodos(previousTodos);\n      setTodoError(err instanceof Error ? err.message : 'Error updating todo');\n    } finally {\n      setTogglingTodoId(null);\n    }\n  };\n\n  const handleUpdateTitle = async (id: string, newTitle: string) => {\n    if (!token) return;\n    const previousTodos = [...todos];\n\n    // Optimistic update\n    setTodos((prev) =>\n      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))\n    );\n    setTodoError(null);\n\n    try {\n      const response = await fetch(`/api/todos/${id}`, {\n        method: 'PATCH',\n        headers: {\n          'Content-Type': 'application/json',\n          Authorization: `Bearer ${token}`,\n        },\n        body: JSON.stringify({ title: newTitle }),\n      });\n\n      if (!response.ok) {\n        const errorData = await response.json().catch(() => ({}));\n        throw new Error(errorData.error || 'Failed to update todo title');\n      }\n\n      const updatedTodo: Todo = await response.json();\n      setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));\n    } catch (err) {\n      setTodos(previousTodos);\n      setTodoError(err instanceof Error ? err.message : 'Error updating todo');\n    }\n  };\n\n  const handleDeleteTodo = async (id: string) => {\n    if (!token) return;\n    const previousTodos = [...todos];\n\n    // Optimistic removal\n    setTodos((prev) => prev.filter((t) => t.id !== id));\n    setTodoError(null);\n\n    try {\n      const response = await fetch(`/api/todos/${id}`, {\n        method: 'DELETE',\n        headers: {\n          Authorization: `Bearer ${token}`,\n        },\n      });\n\n      if (!response.ok) {\n        const errorData = await response.json().catch(() => ({}));\n        throw new Error(errorData.error || 'Failed to delete todo');\n      }\n    } catch (err) {\n      setTodos(previousTodos);\n      setTodoError(err instanceof Error ? err.message : 'Error deleting todo');\n    }\n  };\n\n  if (authLoading) {\n    return (\n      <div className=\"min-h-screen flex items-center justify-center bg-slate-50\">\n        <p className=\"text-sm text-slate-500 animate-pulse\">Loading application...</p>\n      </div>\n    );\n  }\n\n  return (\n    <main className=\"min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50\">\n      <div className=\"max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6\">\n        <header className=\"flex items-center justify-between border-b border-slate-100 pb-4\">\n          <div>\n            <h1 className=\"text-xl font-bold text-slate-900 tracking-tight\">\n              Todo Application\n            </h1>\n            <p className=\"text-xs text-slate-500\">\n              Fullstack TypeScript + Express + React + MongoDB\n            </p>\n          </div>\n          {user && (\n            <button\n              onClick={logout}\n              className=\"text-xs font-medium text-slate-600 hover:text-red-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition-colors\"\n            >\n              Sign out\n            </button>\n          )}\n        </header>\n\n        {user ? (\n          <div className=\"space-y-5\">\n            <div className=\"flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100\">\n              <span>Account:</span>\n              <span className=\"font-semibold text-slate-800\">{user.email}</span>\n            </div>\n\n            <TodoCreator onTodoCreated={handleTodoCreated} />\n\n            {todoError && (\n              <p role=\"alert\" className=\"text-xs text-red-600\">\n                {todoError}\n              </p>\n            )}\n\n            {/* Filter Tabs */}\n            <div className=\"flex items-center justify-between border-b border-slate-100 pb-2\">\n              <span className=\"text-xs font-semibold text-slate-500 uppercase tracking-wider\">\n                Tasks\n              </span>\n              <div className=\"flex gap-1\" role=\"tablist\" aria-label=\"Todo Filters\">\n                {(['all', 'pending', 'completed'] as const).map((tab) => (\n                  <button\n                    key={tab}\n                    type=\"button\"\n                    role=\"tab\"\n                    aria-selected={statusFilter === tab}\n                    onClick={() => handleStatusFilterChange(tab)}\n                    className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${\n                      statusFilter === tab\n                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'\n                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'\n                    }`}\n                  >\n                    {tab}\n                  </button>\n                ))}\n              </div>\n            </div>\n\n            <div className=\"pt-1\">\n              <TodoList\n                todos={todos}\n                isLoading={todosLoading}\n                onToggleStatus={handleToggleStatus}\n                onUpdateTitle={handleUpdateTitle}\n                onDeleteTodo={handleDeleteTodo}\n                isTogglingId={togglingTodoId}\n              />\n            </div>\n          </div>\n        ) : (\n          <div className=\"space-y-4\">\n            <div className=\"flex border-b border-slate-200\" role=\"tablist\">\n              <button\n                type=\"button\"\n                role=\"tab\"\n                aria-selected={authMode === 'login'}\n                onClick={() => setAuthMode('login')}\n                className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${\n                  authMode === 'login'\n                    ? 'border-indigo-600 text-indigo-600'\n                    : 'border-transparent text-slate-500 hover:text-slate-700'\n                }`}\n              >\n                Sign In\n              </button>\n              <button\n                type=\"button\"\n                role=\"tab\"\n                aria-selected={authMode === 'register'}\n                onClick={() => setAuthMode('register')}\n                className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${\n                  authMode === 'register'\n                    ? 'border-indigo-600 text-indigo-600'\n                    : 'border-transparent text-slate-500 hover:text-slate-700'\n                }`}\n              >\n                Create Account\n              </button>\n            </div>\n\n            {authMode === 'login' ? (\n              <LoginForm onSwitchToRegister={() => setAuthMode('register')} />\n            ) : (\n              <RegisterForm\n                onSuccess={() => setAuthMode('login')}\n                onSwitchToLogin={() => setAuthMode('login')}\n              />\n            )}\n          </div>\n        )}\n\n        <footer className=\"pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between\">\n          <span>System Status:</span>\n          {healthLoading ? (\n            <span className=\"text-slate-400 animate-pulse\">Checking...</span>\n          ) : health?.status === 'ok' ? (\n            <span className=\"text-emerald-600 font-medium flex items-center gap-1.5\">\n              <span className=\"w-2 h-2 rounded-full bg-emerald-500 inline-block\"></span>\n              Online (DB Connected)\n            </span>\n          ) : (\n            <span className=\"text-amber-500\">Connecting...</span>\n          )}\n        </footer>\n      </div>\n    </main>\n  );\n}\n\nexport default function App() {\n  return (\n    <AuthProvider>\n      <MainContent />\n    </AuthProvider>\n  );\n}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Todo } from '../types/todo';

interface TodoCreatorProps {
  onTodoCreated: (todo: Todo) => void;
}

export function TodoCreator({ onTodoCreated }: TodoCreatorProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a todo title');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/todos', {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json',\n          Authorization: `Bearer ${token}`,\n        },\n        body: JSON.stringify({ title: trimmed }),\n      });\n\n      const data = await response.json();\n\n      if (!response.ok) {\n        throw new Error(data.error || 'Failed to create todo');\n      }\n\n      setTitle('');\n      onTodoCreated(data);\n    } catch (err) {\n      setError(err instanceof Error ? err.message : 'An unexpected error occurred');\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <form onSubmit={handleSubmit} className="space-y-2" aria-label="Add Todo Form">\n      <div className=\"flex gap-2\">\n        <input\n          type=\"text\"\n          value={title}\n          onChange={(e) => setTitle(e.target.value)}\n          placeholder=\"What needs to be done?\"\n          className=\"flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500\"\n          aria-label=\"New todo title\"\n        />\n        <button\n          type=\"submit\"\n          disabled={loading}\n          className=\"px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors shadow-sm\"\n        >\n          {loading ? 'Adding...' : 'Add'}\n        </button>\n      </div>\n      {error && (\n        <p role=\"alert\" className=\"text-xs text-red-600 font-medium\">\n          {error}\n        </p>\n      )}\n    </form>\n  );\n}

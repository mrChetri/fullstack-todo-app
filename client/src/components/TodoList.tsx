import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Todo } from '../types/todo';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onToggleStatus?: (id: string) => void;
  onUpdateTitle?: (id: string, newTitle: string) => void;
  onDeleteTodo?: (id: string) => void;
  isTogglingId?: string | null;
}

export function TodoList({
  todos,
  isLoading,
  onToggleStatus,
  onUpdateTitle,
  onDeleteTodo,
  isTogglingId,
}: TodoListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setInlineError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setInlineError(null);
  };

  const handleSave = (id: string) => {
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setInlineError('Title cannot be empty');
      return;
    }
    setInlineError(null);
    onUpdateTitle?.(id, trimmed);
    setEditingId(null);
    setEditTitle('');
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center" aria-live="polite">
        <p className="text-sm text-slate-400 animate-pulse">Loading your todos...</p>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="py-8 text-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
        <p className="text-sm font-medium text-slate-500">No todos yet</p>
        <p className="text-xs text-slate-400 mt-1">Add your first task above to get started!</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100" aria-label="Todo List">
      {todos.map((todo) => {
        const isCompleted = todo.status === 'completed';
        const isCurrentlyToggling = isTogglingId === todo.id;
        const isEditing = editingId === todo.id;

        if (isEditing) {
          return (
            <li key={todo.id} className="py-2.5 flex flex-col gap-1 group">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave(todo.id);
                }}
                className="flex items-center gap-2 flex-1"
              >
                <input
                  type="text"
                  autoFocus
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    if (inlineError) setInlineError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  className="flex-1 px-2.5 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  aria-label="Save"
                  onClick={() => handleSave(todo.id)}
                  className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Cancel"
                  onClick={cancelEditing}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
              {inlineError && (
                <p role="alert" className="text-xs text-red-500 pl-1">
                  {inlineError}
                </p>
              )}
            </li>
          );
        }

        return (
          <li key={todo.id} className="py-3 flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <input
                type="checkbox"
                aria-label={`Mark "${todo.title}" as ${isCompleted ? 'pending' : 'completed'}`}
                checked={isCompleted}
                disabled={isCurrentlyToggling}
                onChange={() => onToggleStatus?.(todo.id)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {todo.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Created {new Date(todo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {todo.status}
              </span>
              <button
                type="button"
                aria-label={`Edit "${todo.title}"`}
                onClick={() => startEditing(todo)}
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Delete "${todo.title}"`}
                onClick={() => onDeleteTodo?.(todo.id)}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

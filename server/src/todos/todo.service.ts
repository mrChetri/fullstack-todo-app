import { TodoModel, TodoDocument } from './todo.model.js';
import { CreateTodoInput, UpdateTodoInput } from './todo.schema.js';

export async function createTodo(ownerId: string, input: CreateTodoInput): Promise<TodoDocument> {
  const todo = await TodoModel.create({
    title: input.title,
    status: 'pending',
    owner: ownerId,
  });

  return todo.toJSON() as TodoDocument;
}

export async function getTodosByOwner(
  ownerId: string,
  statusFilter: 'pending' | 'completed' | 'all' = 'all'
): Promise<TodoDocument[]> {
  const query: { owner: string; status?: 'pending' | 'completed' } = { owner: ownerId };
  if (statusFilter && statusFilter !== 'all') {
    query.status = statusFilter;
  }
  const todos = await TodoModel.find(query).sort({ createdAt: 1 });
  return todos.map((t) => t.toJSON() as TodoDocument);
}

export async function updateTodo(
  ownerId: string,
  todoId: string,
  updates: UpdateTodoInput
): Promise<TodoDocument | null> {
  const updateFields: { title?: string; status?: 'pending' | 'completed' } = {};
  if (updates.title !== undefined) updateFields.title = updates.title;
  if (updates.status !== undefined) updateFields.status = updates.status;

  const todo = await TodoModel.findOneAndUpdate(
    { _id: todoId, owner: ownerId },
    { $set: updateFields },
    { new: true }
  );

  if (!todo) {
    return null;
  }

  return todo.toJSON() as TodoDocument;
}

export async function deleteTodo(ownerId: string, todoId: string): Promise<boolean> {
  const result = await TodoModel.findOneAndDelete({ _id: todoId, owner: ownerId });
  return result !== null;
}

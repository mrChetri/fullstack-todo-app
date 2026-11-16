import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { createTodoSchema, updateTodoSchema, getTodosQuerySchema } from './todo.schema.js';
import { createTodo, getTodosByOwner, updateTodo, deleteTodo } from './todo.service.js';

export const todoRouter = Router();

// Protect all todo routes with JWT authentication
todoRouter.use(requireAuth);

todoRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parseResult = createTodoSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorMessages = parseResult.error.errors.map((err) => err.message).join(', ');
    res.status(400).json({ error: errorMessages });
    return;
  }

  try {
    const newTodo = await createTodo(req.user!.id, parseResult.data);
    res.status(201).json(newTodo);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error while creating todo' });
  }
});

todoRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const queryResult = getTodosQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    const errorMessages = queryResult.error.errors.map((err) => err.message).join(', ');
    res.status(400).json({ error: errorMessages });
    return;
  }

  try {
    const todos = await getTodosByOwner(req.user!.id, queryResult.data.status);
    res.status(200).json(todos);
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error while fetching todos' });
  }
});

todoRouter.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  const parseResult = updateTodoSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorMessages = parseResult.error.errors.map((err) => err.message).join(', ');
    res.status(400).json({ error: errorMessages });
    return;
  }

  try {
    const updatedTodo = await updateTodo(
      req.user!.id,
      req.params.id,
      parseResult.data
    );

    if (!updatedTodo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.status(200).json(updatedTodo);
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error while updating todo' });
  }
});

todoRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteTodo(req.user!.id, req.params.id);

    if (!deleted) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error while deleting todo' });
  }
});

import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required and cannot be empty' }),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;

export const updateTodoSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { message: 'Title cannot be empty' })
      .optional(),
    status: z
      .enum(['pending', 'completed'], {
        errorMap: () => ({ message: "Status must be either 'pending' or 'completed'" }),
      })
      .optional(),
  })
  .refine((data) => data.title !== undefined || data.status !== undefined, {
    message: 'At least one field (title or status) must be provided for update',
  });

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

export const getTodosQuerySchema = z.object({
  status: z.enum(['pending', 'completed', 'all'], {
    errorMap: () => ({ message: "Status filter must be 'pending', 'completed', or 'all'\" }),
  }).optional().default('all'),
});

export type GetTodosQueryInput = z.infer<typeof getTodosQuerySchema>;

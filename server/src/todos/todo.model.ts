import { Schema, model, InferSchemaType, Model, Types } from 'mongoose';

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        ret.owner = String(ret.owner);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export type TodoDocument = InferSchemaType<typeof todoSchema> & { id: string };

export const TodoModel: Model<TodoDocument> = model<TodoDocument>('Todo', todoSchema);

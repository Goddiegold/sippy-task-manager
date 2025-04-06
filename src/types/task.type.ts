import { Task, task_priority, task_status } from '@prisma/client';

export interface ITaskPayload extends Partial<Omit<Task, 'image'>> {
  image?: Buffer;
}

export interface ITaskQuery {
  status?: task_status;
  priorty?: task_priority;
  dueDate?: Date;
}
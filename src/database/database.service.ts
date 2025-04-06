import { Injectable } from '@nestjs/common';
import { Task, User } from '@prisma/client';
import { isValidObjectId } from 'src/common/utils';
import { PrismaService } from 'src/prisma.service';
import { ITaskQuery } from 'src/types/task';

@Injectable()
export class DatabaseService {
  constructor(private prisma: PrismaService) { }
  async createUser({ payload }: { payload: User }) {
    const newUser = await this.prisma.user.create({
      data: {
        ...payload,
      },
    });

    return newUser;
  }

  async getUser({ userEmailOrId }: { userEmailOrId: string }) {
    const OR = [];

    OR.push({ email: userEmailOrId });

    if (isValidObjectId(userEmailOrId)) {
      OR.push({ userId: userEmailOrId });
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR,
      },
    });

    return user;
  }

  async updateUser({
    userId,
    payload,
  }: {
    userId: string;
    payload: Partial<User>;
  }) {
    const updatedUser = await this.prisma.user.update({
      where: {
        userId,
      },
      data: {
        ...payload,
      },
    });

    return updatedUser;
  }

  async getUserByOtl({ otl }: { otl: string }) {
    const userWithOtl = await this.prisma.user.findFirst({
      where: {
        otl,
      },
    });

    return userWithOtl;
  }

  async createTask({ task }: { task: Task }) {
    const newTask = await this.prisma.task.create({
      data: {
        ...task,
      },
    });

    return newTask;
  }

  async getTask({ taskId }: { taskId: string }) {
    const task = await this.prisma.task.findFirst({
      where: {
        taskId,
      },
    });

    return task;
  }

  async deleteTask({ taskId }: { taskId: string }) {
    await this.prisma.task.delete({ where: { taskId } });
    return { taskId };
  }

  async updateTask({ taskId, task }: { taskId: string; task: Partial<Task> }) {
    const updatedTask = await this.prisma.task.update({
      where: {
        taskId,
      },
      data: {
        ...task,
      },
    });

    return updatedTask;
  }

  async getUserTasks({ userId }: { userId: string }) {
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks;
  }

  async getUserAssignedTasks({ userId }: { userId: string }) {
    const tasks = await this.prisma.task.findMany({
      where: {
        assignedToId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return tasks;
  }

  async getTasks({ queries }: { queries?: ITaskQuery }) {
    const filter = {
      ...(queries || {}),
    };

    if (queries?.dueDate) {
      const startOfDay = new Date(queries?.dueDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(queries?.dueDate);
      endOfDay.setHours(23, 59, 59, 999);

      filter.dueDate = {
        //@ts-ignore
        gte: startOfDay,
        lte: endOfDay,
      };
    }
    const tasks = await this.prisma.task.findMany({
      where: {
        ...filter,
      },
    });
    return tasks;
  }
}

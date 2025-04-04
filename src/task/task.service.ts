import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Task, user_role } from '@prisma/client';
import { errorMessage } from 'src/common/utils';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TaskService {
  constructor(private databaseService: DatabaseService) { }

  async createTask({ task }: { task: Task }) {
    try {
      return this.databaseService.createTask({ task });
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }

  async getTask({ taskId }: { taskId: string }) {
    try {
      const task = await this.databaseService.getTask({ taskId });
      if (!task) throw new NotFoundException(`Task [${taskId}] not found!`);
      return task;
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }

  async deleteTask({
    taskId,
    currentUserId,
    currentUserRole,
  }: {
    taskId: string;
    currentUserId: string;
    currentUserRole: user_role;
  }) {
    try {
      const task = await this.databaseService.getTask({ taskId });
      if (!task) throw new NotFoundException(`Task [${taskId}] not found!`);

      const userIds = [task.assignedToId, task.userId].filter(Boolean);

      if (
        !userIds?.includes(currentUserId) ||
        currentUserRole !== user_role.admin
      )
        throw new ForbiddenException('You cannot perform this action!');

      return this.databaseService.deleteTask({ taskId });
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }

  async updateTask({
    taskId,
    currentUserId,
    currentUserRole,
    taskPayload,
  }: {
    taskId: string;
    currentUserId: string;
    currentUserRole: user_role;
    taskPayload: Partial<Task>;
  }) {
    try {
      const task = await this.databaseService.getTask({ taskId });
      if (!task) throw new NotFoundException(`Task [${taskId}] not found!`);

      const userIds = [task.assignedToId, task.userId].filter(Boolean);

      if (
        !userIds?.includes(currentUserId) ||
        currentUserRole !== user_role.admin
      )
        throw new ForbiddenException('You cannot perform this action!');

      return this.databaseService.updateTask({
        taskId,
        task: { ...taskPayload },
      });
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }

  async getUserTasks({ userId }: { userId: string }) {
    try {
      return this.databaseService.getUserTasks({ userId })
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }

  async getUserAssignedTasks({ userId }: { userId: string }) {
    try {
      return this.databaseService.getUserAssignedTasks({ userId })
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }

  async getTasks() {
    try {
      return this.databaseService.getTasks()
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Task, user_role } from '@prisma/client';
import {
  deleteFile,
  errorMessage,
  isValidObjectId,
  uploadFile,
} from 'src/common/utils';
import { DatabaseService } from 'src/database/database.service';
import { ITaskPayload, ITaskQuery } from 'src/types/task';

@Injectable()
export class TaskService {
  constructor(private databaseService: DatabaseService) { }

  async createTask({ taskPayload }: { taskPayload: ITaskPayload }) {
    try {
      let secure_url = null;
      let public_id = null;

      if (taskPayload?.image) {
        const result = await uploadFile(taskPayload?.image);
        if (result) {
          secure_url = result?.secure_url
          public_id = result?.public_id
        }
      }

      const newTaskData = {
        ...taskPayload,
        image: secure_url,
        image_id: public_id,
      } as Task;

      return this.databaseService.createTask({ task: newTaskData });
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

      const userIds = [task?.assignedToId, task?.userId].filter(Boolean);

      if (
        !userIds?.includes(currentUserId) &&
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
    taskPayload: ITaskPayload;
  }) {
    try {
      const task = await this.databaseService.getTask({ taskId });
      if (!task) throw new NotFoundException(`Task [${taskId}] not found!`);

      const userIds = [task?.assignedToId, task?.userId].filter(Boolean);
     
      if (
        !userIds?.includes(currentUserId) &&
        currentUserRole !== user_role.admin
      )
        throw new ForbiddenException('You cannot perform this action!');

      if (taskPayload?.assignedToId) {
        if (!isValidObjectId(taskPayload?.assignedToId)) {
          throw new BadRequestException(
            `Assigned user [${taskPayload?.assignedToId}] is invalid!`,
          );
        }
        const user = await this.databaseService.getUser({
          userEmailOrId: taskPayload.assignedToId,
        });
        if (!user)
          throw new NotFoundException(
            `User [${taskPayload.assignedToId}] not found!`,
          );
      }

      if (task?.image_id) {
        deleteFile(task?.image_id);
      }

      let secure_url = null;
      let public_id = null;

      if (task?.image) {
        const result = await uploadFile(taskPayload?.image);
        if (result) {
          secure_url = result?.secure_url
          public_id = result?.public_id
        }
      }

      return this.databaseService.updateTask({
        taskId,
        task: {
          ...taskPayload,
          image: secure_url,
          image_id: public_id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }

  async getUserTasks({ userId }: { userId: string }) {
    try {
      return this.databaseService.getUserTasks({ userId });
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }

  async getUserAssignedTasks({ userId }: { userId: string }) {
    try {
      return this.databaseService.getUserAssignedTasks({ userId });
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }

  async getTasks({ queries }: { queries?: ITaskQuery }) {
    try {
      return this.databaseService.getTasks({ queries });
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }
}

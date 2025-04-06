import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Task, task_priority, task_status, User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ResponseBody } from 'src/types';
import { TaskService } from './task.service';
import { CreateTaskDTO, UpdateTaskDTO } from 'src/dto/task.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ITaskPayload, ITaskQuery } from 'src/types/task';

@Controller('api/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  @UseInterceptors(FileInterceptor('image'))
  async createTask(
    @Body() body: CreateTaskDTO,
    @CurrentUser() currentUser: User,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<ResponseBody<Task>> {
    let payload = {
      ...body,
      userId: currentUser?.userId,
    } as ITaskPayload;

    if (image) {
      // Validate file size and type if an image is provided
      if (image.size > 2097152) {
        throw new BadRequestException('File is too large (max 2MB)');
      }
      if (!image.mimetype.startsWith('image/')) {
        throw new BadRequestException(
          'Invalid file type, only images are allowed',
        );
      }

      payload = { ...payload, image: image?.buffer };
    }
    const result = await this.taskService.createTask({ taskPayload: payload });
    if (result) return { result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async getTasks(
    @Query()
    queries: ITaskQuery,
  ): Promise<ResponseBody<Task[]>> {
    const result = await this.taskService.getTasks({ queries });
    if (result) return { result };
  }

  @Get('/:taskId')
  @UseGuards(JwtAuthGuard)
  async getTask(@Param('taskId') taskId: string): Promise<ResponseBody<Task>> {
    const result = await this.taskService.getTask({ taskId });
    if (result) return { result };
  }

  @Delete('/:taskId')
  @UseGuards(JwtAuthGuard)
  async deleteTask(
    @Param('taskId') taskId: string,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseBody<Partial<Task>>> {
    const currentUserRole = currentUser?.role;
    const currentUserId = currentUser?.userId;
    const result = await this.taskService.deleteTask({
      taskId,
      currentUserId,
      currentUserRole,
    });
    if (result) return { result };
  }

  @Patch('/:taskId')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  async updateTask(
    @Param('taskId') taskId: string,
    @CurrentUser() currentUser: User,
    @Body() body: UpdateTaskDTO,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<ResponseBody<Task>> {
    const currentUserRole = currentUser?.role;
    const currentUserId = currentUser?.userId;
    let payload = {
      ...body,
    } as ITaskPayload;
    if (image) {
      // Validate file size and type if an image is provided
      if (image.size > 2097152) {
        throw new BadRequestException('File is too large (max 2MB)');
      }
      if (!image.mimetype.startsWith('image/')) {
        throw new BadRequestException(
          'Invalid file type, only images are allowed',
        );
      }

      payload = { ...payload, image: image?.buffer };
    }

    const result = await this.taskService.updateTask({
      taskId,
      currentUserId,
      currentUserRole,
      taskPayload: payload,
    });
    if (result) return { result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/assigned')
  async getAssignedTasks(
    @CurrentUser() currentUser: User,
  ): Promise<ResponseBody<Task[]>> {
    const result = await this.taskService.getUserAssignedTasks({
      userId: currentUser.userId,
    });
    if (result) return { result };
  }

  @Get('/me')
  async getUserCreatedTasks(
    @CurrentUser() currentUser: User,
  ): Promise<ResponseBody<Task[]>> {
    const result = await this.taskService.getUserTasks({
      userId: currentUser?.userId,
    });
    if (result) return { result };
  }
}

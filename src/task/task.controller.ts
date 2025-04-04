import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Task, User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ResponseBody } from 'src/types';
import { TaskService } from './task.service';

@Controller('api/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async createTask(
    @Body() body,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseBody<Task>> {
    const payload = {
      ...body,
      userId: currentUser?.userId,
    };
    const result = await this.taskService.createTask({ task: payload });
    if (result) return { result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async getTasks(): Promise<ResponseBody<Task[]>> {
    const result = await this.taskService.getTasks();
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
  @UseGuards(JwtAuthGuard)
  async updateTask(
    @Param('taskId') taskId: string,
    @CurrentUser() currentUser: User,
    @Body() body,
  ): Promise<ResponseBody<Task>> {
    const currentUserRole = currentUser?.role;
    const currentUserId = currentUser?.userId;
    const result = await this.taskService.updateTask({
      taskId,
      currentUserId,
      currentUserRole,
      taskPayload: body,
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

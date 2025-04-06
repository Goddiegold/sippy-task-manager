import { PartialType } from '@nestjs/mapped-types';
import { task_priority, task_status } from '@prisma/client';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsOptional()
  status: task_status;

  @IsNotEmpty()
  @IsOptional()
  priority: task_priority;

  @IsDate()
  @IsOptional()
  dueDate: Date;
}

export class UpdateTaskDTO extends PartialType(CreateTaskDTO) {}

export class AssignUserDTO {
  @IsString()
  @IsNotEmpty()
  assignedToId: string;
}

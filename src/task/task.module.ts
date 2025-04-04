import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PrismaService } from 'src/prisma.service';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [
  ],
  providers: [TaskService, PrismaService, DatabaseService],
  controllers: [TaskController],
})
export class TaskModule { }

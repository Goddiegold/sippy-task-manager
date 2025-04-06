require('dotenv').config();
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { task_status } from '@prisma/client';
import { generateHashedPassword } from 'src/common/utils';
import { Config } from 'src/config';
import { DatabaseService } from 'src/database/database.service';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from 'src/strategies/jwt.strategy.service';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { TaskModule } from '../src/task/task.module';

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let _jwtService: JwtService;
  let testAgent: TestAgent;
  let token = null;
  let taskId = null;
  let userOneId = null;
  let userTwoId = null;
  const dummyUsers = [
    {
      email: 'godwin@gmail.com',
      password: '12345678',
      name: 'Felix',
    },
    {
      email: 'dave@gmail.com',
      password: '12345678',
      name: 'Dave',
    },
  ];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  const firstTask = {
    title: 'My First Task',
    description: 'Complete Assessment',
    status: task_status.in_progress,
    dueDate: currentDate,
  };


  const updatedTask = {
    title: 'My First Task (Updated)',
    description: 'Complete Assessment',
    status: task_status.completed,
    dueDate: currentDate,
  };


  beforeAll(async () => {
    prismaService = new PrismaService();
    await prismaService.user.createMany({
      data: dummyUsers.map((user) => ({
        ...user,
        password: generateHashedPassword(user?.password),
      })),
    });

    const users = await prismaService.user.findMany({
      where: {
        email: {
          in: dummyUsers.map((user) => user.email),
        },
      },
      select: {
        userId: true,
        email: true,
      },
    });

    userOneId = users?.find(
      (user) => user?.email === dummyUsers[0].email,
    )?.userId;
    userTwoId = users?.find(
      (user) => user?.email === dummyUsers[1].email,
    )?.userId;

    if (userOneId) {
      _jwtService = new JwtService();
      token = _jwtService.sign(
        { userId: userOneId },
        { privateKey: Config.JWT_SECRET },
      );
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TaskModule,
        JwtModule.register({
          secret: Config.JWT_SECRET,
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [JwtStrategy, PrismaService, DatabaseService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    testAgent = request(app.getHttpServer());
  }, 50000);

  afterAll(async () => {
    if (userOneId || userTwoId) {
      // await prismaService.task.deleteMany({
      //   where: {
      //     userId: userOneId,
      //   },
      // });

      await prismaService.user.deleteMany({
        where: {
          userId: {
            in: [userOneId, userTwoId].filter(Boolean),
          },
        },
      });
    }
    await app.close();
  }, 50000);

  it('/api/task/create (POST)', async () => {
    const response = await testAgent
      .post('/api/task/create')
      .send(firstTask)
      .set('Authorization', `Bearer ${token}`);
    expect(response.body).toHaveProperty('result');

    console.log('created task', response?.body);

    taskId = response.body?.result?.taskId;

    expect(response.body.result).toMatchObject({
      taskId: expect.any(String),
      title: firstTask.title,
      description: firstTask.description,
      status: firstTask.status,
    });
  }, 20000);

  it('/api/task/:taskId (GET)', async () => {
    const response = await testAgent
      .get(`/api/task/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    console.log("retrieved task", response?.body);

    expect(response.body.result).toMatchObject({
      taskId,
      title: firstTask.title,
      description: firstTask.description,
      status: firstTask.status,
    });
  }, 20000);

  it('/api/task/:taskId (UPDATE)', async () => {
    const response = await testAgent
      .patch(`/api/task/${taskId}`)
      .send(updatedTask)
      .set('Authorization', `Bearer ${token}`);

    console.log("updated task", response?.body);

    expect(response.body.result).toMatchObject({
      taskId,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
    });
  }, 20000);

  it('/api/task/:taskId (DELETE)', async () => {
    const response = await testAgent
      .delete(`/api/task/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    console.log("deleted task", response?.body);

    expect(response.body.result).toMatchObject({
      taskId,
    });
  }, 20000);
});

require('dotenv').config();
import { INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { generateHashedPassword } from 'src/common/utils';
import { Config } from 'src/config';
import { DatabaseService } from 'src/database/database.service';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from 'src/strategies/jwt.strategy.service';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testAgent: TestAgent;
  let userId = null;
  const user = {
    email: 'godwin@gmail.com',
    password: '12345678',
    name: 'Felix',
  };

  beforeAll(async () => {
    prismaService = new PrismaService();
    await prismaService.user.create({
      data: {
        ...user,
        password: generateHashedPassword(user?.password)
      }
    })
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
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
    if (userId) {
      await prismaService.user.delete({
        where: {
          userId,
        },
      });
    }
    await app.close();
  }, 20000);

  it('/api/auth/login (POST)', async () => {
    const loginInput = { ...user };
    delete loginInput.name;
    const response = await testAgent.post('/api/auth/login').send(loginInput);

    console.log('logged user', response?.body);

    userId = response?.body?.result?.userId;
    expect(response.body).toHaveProperty('result');
    expect(response.body.result).toMatchObject({
      userId,
      name: user.name,
      email: user.email,
    });
  }, 20000);
});

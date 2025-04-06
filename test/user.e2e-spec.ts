require('dotenv').config();
import { INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Config } from 'src/config';
import { DatabaseService } from 'src/database/database.service';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from 'src/strategies/jwt.strategy.service';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { UserModule } from '../src/user/user.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testAgent: TestAgent;
  let token = null;
  let userId = null;
  const user = {
    email: 'godwin@gmail.com',
    password: '12345678',
    name: 'Felix',
  };

  beforeAll(async () => {
    prismaService = new PrismaService();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
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
  }, 50000);

  it('/api/user/create (POST)', async () => {
    const response = await testAgent.post('/api/user/create').send(user);

    console.log('create user', response?.body);
    token = response?.header['authorization'];
    userId = response?.body?.result?.userId;

    expect(response.body).toHaveProperty('result');
    expect(response.body.result).toMatchObject({
      userId: expect.any(String),
      name: user.name,
      email: user.email,
    });
  }, 50000);

  it('/api/user/profile (GET)', async () => {
    const response = await testAgent
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    console.log('user profile', response?.body);
    expect(response.body).toHaveProperty('result');
    expect(response.body.result).toMatchObject({
      userId,
      name: user.name,
      email: user.email,
    });
    userId = response?.body?.result?.userId;
  }, 50000);
});

import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { Config } from 'src/config';
import { DatabaseService } from 'src/database/database.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    JwtModule.register({
      secret: Config.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PassportModule, 
  ],
  providers: [UserService, PrismaService, DatabaseService],
  controllers: [UserController],
})
export class UserModule { }

import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './leaderboard.controller';
import { LeaderBoardService } from './leaderboardservice';

@Module({
  imports: [
  ],
  providers: [LeaderBoardService, PrismaService, DatabaseService],
  controllers: [UserController],
})
export class LeaderBoardModule { }

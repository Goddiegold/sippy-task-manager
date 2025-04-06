import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { LeaderBoardModule } from './leader-board/leaderboard.module';

@Module({
  imports: [
    UserModule, 
    AuthModule, 
    TaskModule, 
    LeaderBoardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

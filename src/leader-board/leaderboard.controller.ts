import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ILeaderBoardType, ResponseBody } from 'src/types';
import { LeaderBoardService } from './leaderboardservice';

@Controller('api/leaderboard')
export class UserController {
  constructor(private readonly leaderBoardService: LeaderBoardService) { }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async getLeaderBoardData(): Promise<ResponseBody<ILeaderBoardType[]>> {
    const result = await this.leaderBoardService.getLeaderBoardData();
    if (result) {
      return { result };
    }
  }
}

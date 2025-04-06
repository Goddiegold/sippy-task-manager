import {
  Body,
  Controller,
  Post,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { LeaderBoardService } from './leaderboardservice';

@Controller('api/user')
export class UserController {
  constructor(
    private readonly leaderBoardService: LeaderBoardService,
  ) { }

  @Post('/create')
  async createUser(
    @Body() body,
    @Res({ passthrough: true }) res: Response,
  ) {
   
  }



}

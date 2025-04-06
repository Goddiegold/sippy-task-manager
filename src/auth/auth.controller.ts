import { Body, Controller, Post, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Response } from 'express';
import { LoginInputDTO } from 'src/dto';
import { ResponseBody } from 'src/types';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) { }

  @Post('/login')
  async loginUserLocal(
    @Body() body: LoginInputDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseBody<User>> {
    const result = await this.authService.loginUserLocal({ user: body });
    if (result) {
      const token = this.jwtService.sign({
        userId: result?.userId
      })
      res.setHeader('Authorization', token);
      return { result };
    }
  }
}

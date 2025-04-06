import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { User } from '@prisma/client';
import {
  comparePasswords,
  errorMessage
} from 'src/common/utils';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthService {
  constructor(private databaseService: DatabaseService) {}

  async loginUserLocal({ user }: { user: Partial<User> }) {
    try {
      const userExists = await this.databaseService.getUser({
        userEmailOrId: user.email,
      });

      if (!userExists) throw new NotFoundException('User not registered!');
      const validPassword = comparePasswords(
        user?.password,
        userExists?.password,
      );

      if (!validPassword)
        throw new BadRequestException('Incorrect email or password!');

      const lastLoginAt = new Date();

      await this.databaseService.updateUser({
        userId: userExists.userId,
        payload: {
          lastLoginAt,
        },
      });

      return { ...userExists, password: null };
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }
}

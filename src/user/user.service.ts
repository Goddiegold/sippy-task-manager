import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import {
  errorMessage,
  generateHashedPassword
} from 'src/common/utils';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) { }

  async createUser({ user }: { user: Partial<User> }) {
    try {
      const userExists = await this.databaseService.getUser({
        userEmailOrId: user?.email,
      });

      const lastLoginAt = new Date();

      if (userExists) throw new BadRequestException('User already registered!');
      const password = generateHashedPassword(user.password);
      const newUser = await this.databaseService.createUser({
        payload: { ...user, password, lastLoginAt } as User,
      });

      return { ...newUser, password: null };
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }

  async getUser({ userEmailOrId }: { userEmailOrId: string }) {
    try {
      const user = await this.databaseService.getUser({ userEmailOrId });
      if (!user) throw new NotFoundException('User not found!');

      return {
        ...user,
        password: null,
      };
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }

}

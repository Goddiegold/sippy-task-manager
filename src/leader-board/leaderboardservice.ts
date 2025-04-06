import {
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { task_status } from '@prisma/client';
import { errorMessage } from 'src/common/utils';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class LeaderBoardService {
  constructor(private databaseService: DatabaseService) { }

  async getLeaderBoardData() {
    try {
      const users = await this.databaseService.getUsersForLeaderBoard()

      const leaderboard = users.map((user) => {
        const createdCompleted = user.createdTasks.filter(
          (task) => task.status === task_status.completed,
        ).length;
        const assignedCompleted = user.assignedTasks.filter(
          (task) => task.status === task_status.completed,
        ).length;

        const createdTotal = user.createdTasks.length;
        const assignedTotal = user.assignedTasks.length;

        return {
          userId: user.userId,
          name: user.name,
          email: user?.email,
          completedTotal: createdCompleted + assignedCompleted,
          totalTasks: createdTotal + assignedTotal,
        };
      });

      leaderboard.sort((a, b) => {
        if (b.completedTotal === a.completedTotal) {
          return a.totalTasks - b.totalTasks;
        }
        return b.completedTotal - a.completedTotal;
      });

      return leaderboard;
    } catch (error) {
      throw new InternalServerErrorException(errorMessage(error));
    }
  }



}

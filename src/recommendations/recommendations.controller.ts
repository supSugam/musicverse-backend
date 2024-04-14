import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService
  ) {}

  // @Post('tracks/:userId')
  // async getRecommendedTracksForUser(@Param('userId') userId: string) {
  //   return await this.recommendationsService.getRecommendedTracksForUser(
  //     userId
  //   );
  // }

  @Get('interactions/:userId')
  async getRecommendedTracksForUser(@Param('userId') userId: string) {
    return await this.recommendationsService.getUserInteractions(userId);
  }

  @Get('all-tracks/:userId')
  async getAllTracks(@Param('userId') userId: string) {
    return await this.recommendationsService.getAllTracks(userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getRecommendation(@Request() req) {
    return await this.recommendationsService.getRecommendations(req.user.id);
  }
}

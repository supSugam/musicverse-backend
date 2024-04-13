import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';

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
}

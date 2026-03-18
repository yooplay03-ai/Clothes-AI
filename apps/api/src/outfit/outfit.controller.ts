import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OutfitService } from './outfit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OutfitRecommendationRequest } from '@moodfit/shared';

@ApiTags('outfits')
@Controller('outfits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OutfitController {
  constructor(private readonly outfitService: OutfitService) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'Get user outfit recommendations history' })
  async getRecommendations(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.outfitService.getRecommendations(req.user.id, +page, +limit);
  }

  @Get('recommendations/:id')
  @ApiOperation({ summary: 'Get a specific outfit recommendation' })
  async getRecommendation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.outfitService.getRecommendation(id, req.user.id);
  }

  @Post('recommend')
  @ApiOperation({ summary: 'Request a new AI outfit recommendation' })
  async requestRecommendation(
    @Request() req: any,
    @Body() dto: OutfitRecommendationRequest,
  ) {
    return this.outfitService.requestRecommendation(req.user.id, dto, req.user);
  }

  @Post('recommendations/:id/save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save an outfit recommendation' })
  async saveRecommendation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.outfitService.saveRecommendation(id, req.user.id);
  }

  @Post('wear-log')
  @ApiOperation({ summary: 'Log a worn outfit' })
  async logWear(@Request() req: any, @Body() data: any) {
    return this.outfitService.logWear(req.user.id, data);
  }

  @Get('wear-log')
  @ApiOperation({ summary: 'Get outfit wear history' })
  async getWearHistory(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.outfitService.getWearHistory(req.user.id, +page, +limit);
  }
}

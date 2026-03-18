import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get community outfit feed' })
  @ApiQuery({ name: 'filter', enum: ['trending', 'following', 'recent'], required: false })
  async getFeed(
    @Request() req: any,
    @Query('filter') filter: 'trending' | 'following' | 'recent' = 'trending',
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const userId = req.user?.id || null;
    return this.communityService.getFeed(userId, filter, +page, +limit);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get a specific post' })
  async getPost(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.communityService.getPost(id, userId);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a community post' })
  async createPost(@Request() req: any, @Body() data: any) {
    const userProfile = {
      username: req.user.username,
      displayName: req.user.displayName || req.user.username,
      avatarUrl: req.user.avatarUrl,
    };
    return this.communityService.createPost(req.user.id, userProfile, data);
  }

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a post' })
  async likePost(@Param('id') id: string, @Request() req: any) {
    await this.communityService.likePost(id, req.user.id);
    return { message: 'Post liked' };
  }

  @Delete('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a post' })
  async unlikePost(@Param('id') id: string, @Request() req: any) {
    await this.communityService.unlikePost(id, req.user.id);
    return { message: 'Post unliked' };
  }

  @Post('posts/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bookmark a post' })
  async bookmarkPost(@Param('id') id: string, @Request() req: any) {
    await this.communityService.bookmarkPost(id, req.user.id);
    return { message: 'Post bookmarked' };
  }

  @Delete('posts/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove bookmark from a post' })
  async unbookmarkPost(@Param('id') id: string, @Request() req: any) {
    await this.communityService.unbookmarkPost(id, req.user.id);
    return { message: 'Bookmark removed' };
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Get comments for a post' })
  async getComments(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.communityService.getComments(id, +page, +limit);
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a post' })
  async addComment(
    @Param('id') id: string,
    @Request() req: any,
    @Body('content') content: string,
  ) {
    const userProfile = {
      username: req.user.username,
      displayName: req.user.displayName || req.user.username,
      avatarUrl: req.user.avatarUrl,
    };
    return this.communityService.addComment(id, req.user.id, userProfile, content);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  async deleteComment(@Param('id') id: string, @Request() req: any) {
    await this.communityService.deleteComment(id, req.user.id);
    return { message: 'Comment deleted' };
  }
}

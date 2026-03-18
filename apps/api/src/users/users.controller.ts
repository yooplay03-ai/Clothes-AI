import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '@moodfit/shared';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    return this.usersService.toPublicProfile(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(req.user.id, dto);
    return this.usersService.toPublicProfile(user);
  }

  @Get(':username')
  @ApiOperation({ summary: 'Get user profile by username' })
  async getByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    return this.usersService.toPublicProfile(user);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user' })
  async follow(@Request() req: any, @Param('id') id: string) {
    await this.usersService.follow(req.user.id, id);
    return { message: 'Followed successfully' };
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollow(@Request() req: any, @Param('id') id: string) {
    await this.usersService.unfollow(req.user.id, id);
    return { message: 'Unfollowed successfully' };
  }
}

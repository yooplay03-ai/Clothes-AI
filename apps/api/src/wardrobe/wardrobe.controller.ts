import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WardrobeService } from './wardrobe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateClothingItemDto, UpdateClothingItemDto } from '@moodfit/shared';

@ApiTags('wardrobe')
@Controller('wardrobe')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WardrobeController {
  constructor(private readonly wardrobeService: WardrobeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all clothing items for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categories', required: false, type: String, isArray: true })
  @ApiQuery({ name: 'seasons', required: false, type: String, isArray: true })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  async findAll(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 24,
    @Query('categories') categories?: string | string[],
    @Query('seasons') seasons?: string | string[],
    @Query('sortBy') sortBy?: string,
  ) {
    const categoriesArr = categories
      ? Array.isArray(categories)
        ? categories
        : [categories]
      : undefined;
    const seasonsArr = seasons
      ? Array.isArray(seasons)
        ? seasons
        : [seasons]
      : undefined;

    return this.wardrobeService.findAll(req.user.id, {
      page: +page,
      limit: +limit,
      categories: categoriesArr,
      seasons: seasonsArr,
      sortBy,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get wardrobe statistics' })
  async getStats(@Request() req: any) {
    return this.wardrobeService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific clothing item' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.wardrobeService.findById(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new clothing item to wardrobe' })
  async create(@Request() req: any, @Body() dto: CreateClothingItemDto) {
    return this.wardrobeService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a clothing item' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: UpdateClothingItemDto,
  ) {
    return this.wardrobeService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a clothing item' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    await this.wardrobeService.remove(id, req.user.id);
    return { message: 'Item deleted successfully' };
  }
}

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MusinsaService } from './musinsa.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('musinsa')
@Controller('musinsa')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MusinsaController {
  constructor(private readonly musinsaService: MusinsaService) {}

  @Get()
  @ApiOperation({ summary: '무신사 크롤링 아이템 목록 조회' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 24,
    @Query('category') category?: string,
  ) {
    return this.musinsaService.findAll({ page: +page, limit: +limit, category });
  }

  @Get(':id')
  @ApiOperation({ summary: '무신사 아이템 단건 조회' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.musinsaService.findById(id);
  }

  @Post('import')
  @ApiOperation({ summary: 'metadata.json → DB 임포트' })
  async importMetadata(@Body('metadataPath') metadataPath?: string) {
    return this.musinsaService.importFromMetadata(metadataPath);
  }
}

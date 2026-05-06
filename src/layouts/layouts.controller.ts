import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LayoutsService } from '@/layouts/layouts.service';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('layouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('layouts')
export class LayoutsController {
  constructor(private readonly layoutsService: LayoutsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all layouts' })
  @ApiResponse({ status: 200, description: 'Returns both layout blueprints' })
  findAll() {
    return this.layoutsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a layout by id' })
  @ApiResponse({ status: 200, description: 'Layout found' })
  @ApiResponse({ status: 404, description: 'Layout not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.layoutsService.findOne(id);
  }
}

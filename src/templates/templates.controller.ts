import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateTemplateDto } from '@/templates/dto/create-template.dto';
import { ListTemplatesDto } from '@/templates/dto/list-templates.dto';
import { UpdateTemplateDto } from '@/templates/dto/update-template.dto';
import { TemplatesService } from '@/templates/templates.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

interface AuthRequest {
  user: { id: number; email: string; role: string };
}

@ApiTags('templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({ status: 201, description: 'Template created' })
  @ApiResponse({ status: 404, description: 'Layout not found' })
  create(@Body() dto: CreateTemplateDto, @Request() req: AuthRequest) {
    return this.templatesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List templates (paginated, filterable)' })
  @ApiResponse({ status: 200, description: 'Paginated template list' })
  findAll(@Query() dto: ListTemplatesDto) {
    return this.templatesService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template by id' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.templatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template (layout is immutable)' })
  @ApiResponse({ status: 200, description: 'Template updated' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a template' })
  @ApiResponse({ status: 204, description: 'Template deleted' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.templatesService.remove(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a template' })
  @ApiResponse({ status: 201, description: 'Duplicate created' })
  @ApiResponse({ status: 404, description: 'Source template not found' })
  duplicate(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthRequest,
  ) {
    return this.templatesService.duplicate(id, req.user.id);
  }

  @Get(':id/sends')
  @ApiOperation({ summary: 'List send history for a template' })
  @ApiResponse({ status: 200, description: 'Paginated send history' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findSends(
    @Param('id', ParseIntPipe) id: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.templatesService.findSends(
      id,
      pagination.page,
      pagination.limit,
    );
  }
}

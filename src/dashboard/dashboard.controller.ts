import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { DashboardService } from '@/dashboard/dashboard.service';
import { UserActivityDto } from '@/dashboard/dto/user-activity.dto';
import { UserRole } from '@/entities/user.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get total / this-month / today sent counts' })
  @ApiResponse({ status: 200 })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Daily send activity by layout for the last N days',
  })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  @ApiResponse({ status: 200 })
  getActivity(@Query('days') days = '30') {
    return this.dashboardService.getActivity(
      Math.max(1, parseInt(days, 10) || 30),
    );
  }

  @Get('layout-split')
  @ApiOperation({ summary: 'Total sent counts split by layout' })
  @ApiResponse({ status: 200 })
  getLayoutSplit() {
    return this.dashboardService.getLayoutSplit();
  }

  @Get('top-templates')
  @ApiOperation({ summary: 'Top 5 templates by send count' })
  @ApiResponse({ status: 200 })
  getTopTemplates() {
    return this.dashboardService.getTopTemplates();
  }

  @Get('recent-sends')
  @ApiOperation({ summary: 'Last 10 sends across all templates' })
  @ApiResponse({ status: 200 })
  getRecentSends() {
    return this.dashboardService.getRecentSends();
  }

  @Get('user-activity')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Paginated send history per user (Super Admin only)',
  })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Super Admin only' })
  getUserActivity(@Query() dto: UserActivityDto) {
    return this.dashboardService.getUserActivity(dto);
  }
}

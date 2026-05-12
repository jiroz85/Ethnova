import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReport(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      product_id?: string;
      seller_id?: string;
      reason: string;
      description?: string;
    },
  ) {
    return this.reportsService.createReport({
      reporter_id: user.id,
      product_id: body.product_id,
      seller_id: body.seller_id,
      reason: body.reason,
      description: body.description,
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Roles('admin')
  @Get()
  async getAllReports(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Query('status') status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
  ) {
    return this.reportsService.getAllReports({
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
      status,
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Roles('admin')
  @Get(':id')
  async getReportById(@Param('id') id: string) {
    return this.reportsService.getReportById(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Roles('admin')
  @Patch(':id/status')
  async updateReportStatus(
    @Param('id') id: string,
    @Body() body: { status: 'pending' | 'reviewed' | 'resolved' | 'dismissed' },
  ) {
    return this.reportsService.updateReportStatus(id, body.status);
  }
}

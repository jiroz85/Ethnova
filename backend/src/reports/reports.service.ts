import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(data: {
    reporter_id?: string;
    product_id?: string;
    seller_id?: string;
    reason: string;
    description?: string;
  }) {
    if (!data.product_id && !data.seller_id) {
      throw new BadRequestException(
        'Either product_id or seller_id is required',
      );
    }

    const report = await this.prisma.reports.create({
      data,
      include: {
        reporter: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            seller: {
              select: {
                id: true,
                full_name: true,
              },
            },
          },
        },
        seller: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    return report;
  }

  async getAllReports(options: {
    take?: number;
    skip?: number;
    status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  }) {
    const where = options.status ? { status: options.status } : {};

    const [reports, total] = await Promise.all([
      this.prisma.reports.findMany({
        where,
        take: options.take,
        skip: options.skip,
        orderBy: { created_at: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              seller: {
                select: {
                  id: true,
                  full_name: true,
                },
              },
            },
          },
          seller: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.reports.count({ where }),
    ]);

    return {
      reports,
      total,
      take: options.take,
      skip: options.skip,
    };
  }

  async updateReportStatus(
    id: string,
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
  ) {
    const report = await this.prisma.reports.update({
      where: { id },
      data: { status, updated_at: new Date() },
      include: {
        reporter: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            seller: {
              select: {
                id: true,
                full_name: true,
              },
            },
          },
        },
        seller: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    return report;
  }

  async getReportById(id: string) {
    const report = await this.prisma.reports.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            currency: true,
            seller: {
              select: {
                id: true,
                full_name: true,
                email: true,
                phone: true,
              },
            },
            images: {
              select: {
                id: true,
                url: true,
                sort_order: true,
              },
              orderBy: { sort_order: 'asc' },
            },
          },
        },
        seller: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            telegram_username: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new BadRequestException('Report not found');
    }

    return report;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, includeArchived = false) {
    return this.prisma.category.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { archived: false }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: string, data: any) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type, // e.g. "INCOME", "EXPENSE", "BOTH"
        isDefault: data.isDefault ?? false,
        userId,
      },
    });
  }

  async update(userId: string, id: string, data: any) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: data.name ?? category.name,
        icon: data.icon ?? category.icon,
        color: data.color ?? category.color,
        type: data.type ?? category.type,
      },
    });
  }

  async remove(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.transactions > 0) {
      // Archive the category
      return this.prisma.category.update({
        where: { id },
        data: { archived: true },
      });
    } else {
      // Hard delete the category
      return this.prisma.category.delete({
        where: { id },
      });
    }
  }
}

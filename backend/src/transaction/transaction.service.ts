import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { STORAGE_SERVICE_TOKEN } from '../uploads/storage.service.interface';
import type { StorageService } from '../uploads/storage.service.interface';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_SERVICE_TOKEN) private storageService: StorageService
  ) {}

  async create(userId: string, data: CreateTransactionDto, file?: Express.Multer.File) {
    let attachmentUrl: string | undefined;
    let attachmentType: string | undefined;

    if (file) {
      const upload = await this.storageService.save(file, userId);
      attachmentUrl = upload.url;
      attachmentType = upload.type;
    }

    return this.prisma.transaction.create({
      data: {
        amount: Number(data.amount), // ensure numeric conversion if coming from multipart form
        type: data.type,
        categoryId: data.categoryId,
        date: data.date ? new Date(data.date) : undefined,
        description: data.description,
        note: data.note,
        attachmentUrl,
        attachmentType,
        userId,
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
    });
  }

  async update(userId: string, id: string, data: UpdateTransactionDto, file?: Express.Multer.File) {
    const transaction = await this.findOne(userId, id);

    let attachmentUrl = transaction.attachmentUrl;
    let attachmentType = transaction.attachmentType;
    let oldAttachmentUrl: string | null = null;

    if (file) {
      // 1. Save new file first to prevent loss on write failure
      const upload = await this.storageService.save(file, userId);
      oldAttachmentUrl = transaction.attachmentUrl;
      attachmentUrl = upload.url;
      attachmentType = upload.type;
    }

    // 2. Perform DB update
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        amount: data.amount !== undefined ? Number(data.amount) : undefined,
        type: data.type,
        categoryId: data.categoryId,
        date: data.date ? new Date(data.date) : undefined,
        description: data.description,
        note: data.note,
        attachmentUrl,
        attachmentType,
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
    });

    // 3. Delete old file only after successful DB update
    if (oldAttachmentUrl) {
      await this.storageService.delete(oldAttachmentUrl);
    }

    return updatedTransaction;
  }

  async findAll(
    userId: string,
    filters: { startDate?: string; endDate?: string; categoryId?: string; type?: string }
  ) {
    const where: any = { userId };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async remove(userId: string, id: string) {
    const transaction = await this.findOne(userId, id);

    const deleted = await this.prisma.transaction.delete({
      where: { id: transaction.id },
    });

    // Clean up file only after successful DB delete
    if (transaction.attachmentUrl) {
      await this.storageService.delete(transaction.attachmentUrl);
    }

    return deleted;
  }

  async getSummary(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      select: {
        amount: true,
        type: true,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of transactions) {
      const typeLower = tx.type.toLowerCase();
      if (typeLower === 'income') {
        totalIncome += tx.amount;
      } else if (typeLower === 'expense') {
        totalExpense += tx.amount;
      }
    }

    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
  }
}

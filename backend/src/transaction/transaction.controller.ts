import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseInterceptors(FileInterceptor('attachment'))
  create(
    @Request() req: any,
    @Body() body: CreateTransactionDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.transactionService.create(req.user.sub, body, file);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: string
  ) {
    return this.transactionService.findAll(req.user.sub, {
      startDate,
      endDate,
      categoryId,
      type,
    });
  }

  @Get('summary')
  getSummary(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.transactionService.getSummary(req.user.sub, startDate, endDate);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.transactionService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('attachment'))
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateTransactionDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.transactionService.update(req.user.sub, id, body, file);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.transactionService.remove(req.user.sub, id);
  }
}

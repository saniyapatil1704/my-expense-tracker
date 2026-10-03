import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(@Request() req: any, @Query('includeArchived') includeArchived?: string) {
    const showArchived = includeArchived === 'true';
    return this.categoryService.findAll(req.user.sub, showArchived);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.categoryService.create(req.user.sub, body);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.categoryService.update(req.user.sub, id, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.categoryService.remove(req.user.sub, id);
  }
}

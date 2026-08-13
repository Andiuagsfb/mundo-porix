import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { $Enums } from '../generated/prisma/client';

@ApiTags('Categorías')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar categorías' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Crear categoría (admin)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Actualizar categoría (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Eliminar categoría (admin)' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}

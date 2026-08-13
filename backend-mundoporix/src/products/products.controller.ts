import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { $Enums } from '../generated/prisma/client';

@ApiTags('Productos')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('products')
  @ApiOperation({ summary: 'Listar productos activos (paginado y filtros)' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query, true);
  }

  @Public()
  @Get('products/:id')
  @ApiOperation({ summary: 'Obtener producto por id o slug' })
  findOne(@Param('id') id: string) {
    const isSlug = !/^[a-z0-9]{20,30}$/i.test(id);
    return isSlug
      ? this.productsService.findBySlug(id)
      : this.productsService.findById(id);
  }

  @Post('admin/products')
  @Roles($Enums.RoleName.ADMIN, $Enums.RoleName.SELLER)
  @ApiOperation({ summary: 'Crear producto (admin)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get('admin/products')
  @Roles($Enums.RoleName.ADMIN, $Enums.RoleName.SELLER)
  @ApiOperation({ summary: 'Listar productos (admin, incluye inactivos)' })
  findAllAdmin(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query, false);
  }

  @Patch('admin/products/:id')
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Actualizar producto (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete('admin/products/:id')
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Eliminar producto (admin)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

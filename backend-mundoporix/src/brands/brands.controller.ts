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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { $Enums } from '../generated/prisma/client';

@ApiTags('Marcas')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar marcas' })
  findAll() {
    return this.brandsService.findAll();
  }

  @Post()
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Crear marca (admin)' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @Patch(':id')
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Actualizar marca (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  @Delete(':id')
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Eliminar marca (admin)' })
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}

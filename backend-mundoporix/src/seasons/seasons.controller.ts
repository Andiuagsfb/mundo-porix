import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeasonsService } from './seasons.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { AddSeasonProductsDto } from './dto/add-season-products.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { $Enums } from '../generated/prisma/client';

@ApiTags('Temporadas')
@Controller()
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Public()
  @Get('seasons')
  @ApiOperation({ summary: 'Listar temporadas activas' })
  findAll() {
    return this.seasonsService.findAll(true);
  }

  @Public()
  @Get('seasons/:id')
  @ApiOperation({ summary: 'Obtener temporada con sus productos' })
  findById(@Param('id') id: string) {
    return this.seasonsService.findById(id);
  }

  @Post('admin/seasons')
  @ApiBearerAuth()
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Crear temporada (admin)' })
  create(@Body() dto: CreateSeasonDto) {
    return this.seasonsService.create(dto);
  }

  @Get('admin/seasons')
  @ApiBearerAuth()
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Listar todas las temporadas (admin)' })
  findAllAdmin() {
    return this.seasonsService.findAll(false);
  }

  @Patch('admin/seasons/:id')
  @ApiBearerAuth()
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Actualizar temporada (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateSeasonDto) {
    return this.seasonsService.update(id, dto);
  }

  @Delete('admin/seasons/:id')
  @ApiBearerAuth()
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Eliminar temporada (admin)' })
  remove(@Param('id') id: string) {
    return this.seasonsService.remove(id);
  }

  @Post('admin/seasons/:id/products')
  @ApiBearerAuth()
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Agregar productos a la temporada (admin)' })
  addProducts(@Param('id') id: string, @Body() dto: AddSeasonProductsDto) {
    return this.seasonsService.addProducts(id, dto.productIds);
  }

  @Delete('admin/seasons/:id/products')
  @ApiBearerAuth()
  @Roles($Enums.RoleName.ADMIN)
  @ApiOperation({ summary: 'Quitar productos de la temporada (admin)' })
  removeProducts(@Param('id') id: string, @Body() dto: AddSeasonProductsDto) {
    return this.seasonsService.removeProducts(id, dto.productIds);
  }
}

import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { $Enums } from '../generated/prisma/client';

@ApiTags('Inventario')
@Controller('admin/inventory')
@Roles($Enums.RoleName.ADMIN, $Enums.RoleName.SELLER)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Listar inventario (paginado)' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.inventoryService.findAll(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Obtener inventario de un producto' })
  findByProductId(@Param('productId') productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @Patch(':productId')
  @ApiOperation({ summary: 'Ajustar stock de un producto' })
  adjustQuantity(
    @Param('productId') productId: string,
    @Body() dto: AdjustInventoryDto,
  ) {
    return this.inventoryService.adjustQuantity(productId, dto.quantity);
  }
}

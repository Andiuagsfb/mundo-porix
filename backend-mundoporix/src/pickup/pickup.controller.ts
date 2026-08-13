import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PickupService } from './pickup.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { $Enums } from '../generated/prisma/client';

@ApiTags('Recogida')
@ApiBearerAuth()
@Controller('admin/pickup')
@Roles($Enums.RoleName.ADMIN, $Enums.RoleName.SELLER)
export class PickupController {
  constructor(private readonly pickupService: PickupService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Listar cotizaciones pendientes de recogida' })
  listPending() {
    return this.pickupService.listPending();
  }

  @Patch(':quoteId/prepare')
  @ApiOperation({ summary: 'Marcar cotización como en preparación' })
  prepare(@Param('quoteId') quoteId: string, @CurrentUser() user: AuthUser) {
    return this.pickupService.prepare(quoteId, user.id);
  }

  @Patch(':quoteId/ready')
  @ApiOperation({ summary: 'Marcar cotización como lista para recoger' })
  ready(@Param('quoteId') quoteId: string, @CurrentUser() user: AuthUser) {
    return this.pickupService.ready(quoteId, user.id);
  }

  @Patch(':quoteId/complete')
  @ApiOperation({ summary: 'Marcar cotización como recogida' })
  complete(@Param('quoteId') quoteId: string, @CurrentUser() user: AuthUser) {
    return this.pickupService.complete(quoteId, user.id);
  }
}

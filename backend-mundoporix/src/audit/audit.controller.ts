import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Roles } from '../common/decorators/roles.decorator';
import { $Enums } from '../generated/prisma/client';

@ApiTags('Auditoría')
@ApiBearerAuth()
@Controller('admin/audit-logs')
@Roles($Enums.RoleName.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Listar registros de auditoría (paginado)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.auditService.findAll(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      entity,
      entityId,
    );
  }
}

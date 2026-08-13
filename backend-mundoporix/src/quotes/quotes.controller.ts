import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import { QuoteQueryDto } from './dto/quote-query.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { $Enums } from '../generated/prisma/client';

@ApiTags('Cotizaciones')
@Controller()
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Public()
  @Post('quotes')
  @ApiOperation({ summary: 'Generar cotización (público)' })
  createPublic(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @Post('admin/quotes')
  @ApiBearerAuth()
  @Roles($Enums.RoleName.ADMIN, $Enums.RoleName.SELLER)
  @ApiOperation({ summary: 'Generar cotización (vendedor)' })
  createAdmin(@Body() dto: CreateQuoteDto, @CurrentUser() user: AuthUser) {
    return this.quotesService.create(dto, user.id);
  }

  @Public()
  @Get('quotes/:quoteNumber')
  @ApiOperation({ summary: 'Consultar cotización por número' })
  findByQuoteNumber(@Param('quoteNumber') quoteNumber: string) {
    return this.quotesService.findByQuoteNumber(quoteNumber);
  }

  @Get('admin/quotes')
  @ApiBearerAuth()
  @Roles($Enums.RoleName.ADMIN, $Enums.RoleName.SELLER)
  @ApiOperation({ summary: 'Listar cotizaciones (paginado y filtros)' })
  findAll(@Query() query: QuoteQueryDto) {
    return this.quotesService.findAll(query);
  }

  @Get('admin/quotes/:id')
  @ApiBearerAuth()
  @Roles($Enums.RoleName.ADMIN, $Enums.RoleName.SELLER)
  @ApiOperation({ summary: 'Obtener cotización por id' })
  findById(@Param('id') id: string) {
    return this.quotesService.findById(id);
  }

  @Patch('admin/quotes/:id/status')
  @ApiBearerAuth()
  @Roles($Enums.RoleName.ADMIN, $Enums.RoleName.SELLER)
  @ApiOperation({ summary: 'Cambiar estado de una cotización' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateQuoteStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.quotesService.transition(id, dto.status, user.id);
  }

  @Post('admin/quotes/:id/cancel')
  @ApiBearerAuth()
  @Roles($Enums.RoleName.ADMIN, $Enums.RoleName.SELLER)
  @ApiOperation({ summary: 'Cancelar una cotización' })
  cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.quotesService.cancel(id, user.id);
  }
}

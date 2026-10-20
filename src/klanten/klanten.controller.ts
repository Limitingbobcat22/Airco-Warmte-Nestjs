import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  Patch,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { ExportQueryDto } from '../common/dto/export-query.dto';
import { excelDownload } from '../common/excel-export';
import { SearchQueryDto } from '../common/dto/search-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateKlantDto } from './dto/create-klant.dto';
import { UpdateKlantDto } from './dto/update-klant.dto';
import { KlantenService } from './klanten.service';

@ApiTags('klanten')
@Controller('klanten')
export class KlantenController {
  constructor(private readonly klanten: KlantenService) {}

  @Post()
  @ApiOperation({
    summary: 'Klant aanmaken (publiek). Bij gekozen airco wordt intern een offerte aangemaakt.',
  })
  @ApiCreatedResponse({ description: 'Klant aangemaakt' })
  create(@Body() dto: CreateKlantDto) {
    return this.klanten.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lijst alle klanten (admin)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({ description: 'Klanten, nieuwste eerst' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findAll(@Query() query: SearchQueryDto) {
    return this.klanten.findAll(query.search);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary:
      'Exporteer klanten naar Excel (admin). Zelfde zoekfilter als de lijst.',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'columns', required: false })
  @ApiOkResponse({ description: 'Excel-bestand met de kolommen van de klantentabel' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async exportExcel(@Query() query: ExportQueryDto): Promise<StreamableFile> {
    const file = await this.klanten.exportExcel(query.search, query.columns);
    return excelDownload(file, 'klanten');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eén klant ophalen (admin)' })
  @ApiNotFoundResponse({ description: 'Klant niet gevonden' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.klanten.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Klant bijwerken (admin)' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateKlantDto,
  ) {
    return this.klanten.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Klant verwijderen (admin)' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.klanten.remove(id);
    return { ok: true };
  }
}

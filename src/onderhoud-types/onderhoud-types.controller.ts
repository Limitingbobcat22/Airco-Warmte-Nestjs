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
import { CreateOnderhoudTypeDto } from './dto/create-onderhoud-type.dto';
import { UpdateOnderhoudTypeDto } from './dto/update-onderhoud-type.dto';
import { OnderhoudTypesService } from './onderhoud-types.service';

@ApiTags('onderhoud-types')
@Controller('onderhoud-types')
export class OnderhoudTypesController {
  constructor(private readonly types: OnderhoudTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Lijst alle onderhoudtypes (publiek)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({ description: 'Onderhoudtypes, op volgorde' })
  findAll(@Query() query: SearchQueryDto) {
    return this.types.findAll(query.search);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary:
      'Exporteer onderhoudtypes naar Excel (admin). Zelfde zoekfilter als de lijst.',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'columns', required: false })
  @ApiOkResponse({ description: 'Excel-bestand' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async exportExcel(@Query() query: ExportQueryDto): Promise<StreamableFile> {
    const file = await this.types.exportExcel(query.search, query.columns);
    return excelDownload(file, 'onderhoud-types');
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Onderhoudtype aanmaken (admin)' })
  @ApiCreatedResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  create(@Body() dto: CreateOnderhoudTypeDto) {
    return this.types.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Onderhoudtype bijwerken (admin)' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnderhoudTypeDto,
  ) {
    return this.types.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Onderhoudtype verwijderen (admin)' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.types.remove(id);
    return { ok: true };
  }
}

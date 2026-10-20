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
  Put,
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
import { SearchQueryDto } from '../common/dto/search-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOfferteDto } from './dto/create-offerte.dto';
import { UpdateOfferteDto } from './dto/update-offerte.dto';
import { UpdateOfferteReadDto } from './dto/update-offerte-read.dto';
import { OffertesService } from './offertes.service';

@ApiTags('offertes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('offertes')
export class OffertesController {
  constructor(private readonly offertes: OffertesService) {}

  @Post()
  @ApiOperation({ summary: 'Offerte aanmaken (admin)' })
  @ApiCreatedResponse({ description: 'Offerte aangemaakt' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  create(@Body() dto: CreateOfferteDto) {
    return this.offertes.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lijst alle offertes (admin)',
    description:
      'Leest uit de view airco_offerte_overzicht: offerte + klant + airco + jaarvoordeel.',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({ description: 'Offertes uit view airco_offerte_overzicht, nieuwste eerst' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findAll(@Query() query: SearchQueryDto) {
    return this.offertes.findAll(query.search);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Eén offerte ophalen (admin)',
    description: 'Leest uit de view airco_offerte_overzicht.',
  })
  @ApiNotFoundResponse({ description: 'Offerte niet gevonden' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.offertes.findOne(id);
  }

  @Put(':id/read')
  @ApiOperation({
    summary: 'Offerte gelezen-status bijwerken (admin)',
    description:
      'Zet alleen het veld read. Gebruik dit bij het openen van de offerte in beheer.',
  })
  @ApiOkResponse({ description: 'Gelezen-status bijgewerkt' })
  @ApiNotFoundResponse({ description: 'Offerte niet gevonden' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  updateRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOfferteReadDto,
  ) {
    return this.offertes.updateRead(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Offerte bijwerken (admin)' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOfferteDto,
  ) {
    return this.offertes.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Offerte verwijderen (admin)' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.offertes.remove(id);
    return { ok: true };
  }
}

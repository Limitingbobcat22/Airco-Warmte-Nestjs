import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
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
  @ApiOkResponse({ description: 'Klanten, nieuwste eerst' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findAll() {
    return this.klanten.findAll();
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

import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { AdminCreateOnderhoudOfferteDto } from './dto/admin-create-onderhoud-offerte.dto';
import { CreateOnderhoudOfferteDto } from './dto/create-onderhoud-offerte.dto';
import { UpdateOnderhoudOfferteDto } from './dto/update-onderhoud-offerte.dto';
import { OnderhoudOffertesService } from './onderhoud-offertes.service';
import type { UploadedFilePayload } from './uploaded-file';

const PHOTO_UPLOAD = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
};

@ApiTags('onderhoud-offertes')
@Controller('onderhoud-offertes')
export class OnderhoudOffertesController {
  constructor(private readonly offertes: OnderhoudOffertesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('photos', 3, PHOTO_UPLOAD))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'phone', 'street', 'houseNumber', 'postalCode', 'city', 'consentContact', 'consentTerms', 'typeIds'],
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        street: { type: 'string' },
        houseNumber: { type: 'string' },
        postalCode: { type: 'string' },
        city: { type: 'string' },
        note: { type: 'string' },
        consentContact: { type: 'boolean' },
        consentTerms: { type: 'boolean' },
        typeIds: { type: 'string', description: 'JSON-array met type-id\'s' },
        photos: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiOperation({
    summary: 'Onderhoudofferte aanmaken met klantgegevens, types en foto\'s (publiek)',
  })
  @ApiCreatedResponse({ description: 'Onderhoudofferte aangemaakt' })
  create(
    @Body() dto: CreateOnderhoudOfferteDto,
    @UploadedFiles() photos: UploadedFilePayload[] = [],
  ) {
    return this.offertes.create(dto, photos ?? []);
  }

  @Post('beheer')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('photos', 3, PHOTO_UPLOAD))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Onderhoudofferte handmatig aanmaken (admin)',
  })
  @ApiCreatedResponse({ description: 'Onderhoudofferte aangemaakt' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  createByAdmin(
    @Body() dto: AdminCreateOnderhoudOfferteDto,
    @UploadedFiles() photos: UploadedFilePayload[] = [],
  ) {
    return this.offertes.create(dto, photos ?? []);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lijst alle onderhoudoffertes (admin)' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findAll() {
    return this.offertes.findAll();
  }

  @Get(':id/fotos/:fotoId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Foto van een onderhoudofferte (admin)' })
  @ApiNotFoundResponse()
  @Header('Cache-Control', 'private, max-age=3600')
  async getFoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fotoId', ParseUUIDPipe) fotoId: string,
  ) {
    const foto = await this.offertes.getFotoBuffer(id, fotoId);
    return new StreamableFile(foto.data, {
      type: foto.mimeType,
      disposition: `inline; filename="${foto.originalFilename}"`,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eén onderhoudofferte ophalen (admin)' })
  @ApiNotFoundResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.offertes.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('photos', 3, PHOTO_UPLOAD))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Onderhoudofferte bijwerken (admin)' })
  @ApiNotFoundResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnderhoudOfferteDto,
    @UploadedFiles() photos: UploadedFilePayload[] = [],
  ) {
    return this.offertes.update(id, dto, photos ?? []);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Onderhoudofferte verwijderen (admin)' })
  @ApiNotFoundResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.offertes.remove(id);
    return { ok: true };
  }
}

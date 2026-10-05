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
  Put,
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
import { UpdateOnderhoudOfferteReadDto } from './dto/update-onderhoud-offerte-read.dto';
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
  @UseInterceptors(FilesInterceptor('images', 3, PHOTO_UPLOAD))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['klantId', 'typeIds'],
      properties: {
        klantId: { type: 'string', format: 'uuid' },
        typeIds: { type: 'string', description: 'JSON-array met type-id\'s' },
        images: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiOperation({
    summary: 'Onderhoudofferte aanmaken met klant, onderhoudtype en afbeeldingen (publiek)',
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
  @UseInterceptors(FilesInterceptor('images', 3, PHOTO_UPLOAD))
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
    return this.offertes.create(dto, photos ?? [], { read: true });
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Overzicht van onderhoudoffertes uit onderhoud_offerte_overview (admin)',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findAll() {
    return this.offertes.findAll();
  }

  @Get(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Afbeelding van een onderhoudofferte (admin)' })
  @ApiNotFoundResponse()
  @Header('Cache-Control', 'private, max-age=3600')
  async getImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    const image = await this.offertes.getImageBuffer(id, imageId);
    return new StreamableFile(image.data, {
      type: image.mimeType,
      disposition: `inline; filename="${image.originalFilename}"`,
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

  @Put(':id/read')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Onderhoudofferte gelezen-status bijwerken (admin)',
    description:
      'Zet alleen het veld read. Gebruik dit bij het openen van de offerte in beheer.',
  })
  @ApiOkResponse({ description: 'Gelezen-status bijgewerkt' })
  @ApiNotFoundResponse({ description: 'Onderhoudofferte niet gevonden' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  updateRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnderhoudOfferteReadDto,
  ) {
    return this.offertes.updateRead(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('images', 3, PHOTO_UPLOAD))
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

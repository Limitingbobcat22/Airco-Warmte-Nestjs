import {
  BadRequestException,
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { AircosService, MAX_AIRCO_IMAGES } from './aircos.service';
import { CreateAircoDto } from './dto/create-airco.dto';
import { UpdateAircoDto } from './dto/update-airco.dto';
import type { UploadedFilePayload } from './uploaded-file';

const IMAGE_UPLOAD = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (
    _req: unknown,
    file: Pick<UploadedFilePayload, 'mimetype'>,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(
        new BadRequestException('Alleen afbeeldingen zijn toegestaan.'),
        false,
      );
      return;
    }
    cb(null, true);
  },
};

@ApiTags('aircos')
@Controller('aircos')
export class AircosController {
  constructor(private readonly aircos: AircosService) {}

  @Get()
  @ApiOperation({ summary: 'Lijst alle aircos (publiek)' })
  @ApiOkResponse({
    description: 'Airco-modellen inclusief foto-metadata',
  })
  findAll() {
    return this.aircos.findAll();
  }

  @Get(':id/images/:imageId')
  @ApiOperation({ summary: 'Foto-bytes van een airco (publiek)' })
  @ApiNotFoundResponse({ description: 'Foto niet gevonden' })
  @Header('Cache-Control', 'public, max-age=86400')
  async getImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    const image = await this.aircos.getImageBuffer(id, imageId);
    return new StreamableFile(image.data, {
      type: image.mimeType,
      disposition: `inline; filename="${image.originalFilename}"`,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Eén airco ophalen (publiek)' })
  @ApiNotFoundResponse({ description: 'Airco niet gevonden' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.aircos.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Airco aanmaken (admin)' })
  @ApiCreatedResponse({ description: 'Airco aangemaakt' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  create(@Body() dto: CreateAircoDto) {
    return this.aircos.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Airco bijwerken (admin)' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAircoDto) {
    return this.aircos.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Airco verwijderen (admin)' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.aircos.remove(id);
    return { ok: true };
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file', IMAGE_UPLOAD))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: `Foto uploaden (admin, max ${MAX_AIRCO_IMAGES} per airco)`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        sortOrder: {
          type: 'integer',
          minimum: 0,
          maximum: 2,
          description: 'Slot 0, 1 of 2. Leeg = eerste vrije slot.',
        },
        label: {
          type: 'string',
          example: 'Vooraanzicht',
        },
      },
    },
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: UploadedFilePayload,
    @Body('sortOrder') sortOrder?: string,
    @Body('label') label?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Geen bestand ontvangen.');
    }
    const parsed =
      sortOrder == null || sortOrder === ''
        ? undefined
        : Number.parseInt(sortOrder, 10);
    return this.aircos.uploadImage(id, file, {
      sortOrder: Number.isNaN(parsed as number) ? undefined : parsed,
      label,
    });
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Foto verwijderen (admin)' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.aircos.removeImage(id, imageId);
  }
}

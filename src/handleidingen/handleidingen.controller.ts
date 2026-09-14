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
import { CreateHandleidingDto } from './dto/create-handleiding.dto';
import { UpdateHandleidingDto } from './dto/update-handleiding.dto';
import { HandleidingenService } from './handleidingen.service';
import type { UploadedFilePayload } from './uploaded-file';

const PDF_UPLOAD = {
  storage: memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (
    _req: unknown,
    file: Pick<UploadedFilePayload, 'mimetype'>,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new BadRequestException('Alleen PDF-bestanden zijn toegestaan.'), false);
      return;
    }
    cb(null, true);
  },
};

@ApiTags('handleidingen')
@Controller('handleidingen')
export class HandleidingenController {
  constructor(private readonly handleidingen: HandleidingenService) {}

  @Get()
  @ApiOperation({ summary: 'Lijst alle handleidingen (publiek)' })
  @ApiOkResponse({ description: 'Handleidingen-metadata, nieuwste eerst' })
  findAll() {
    return this.handleidingen.findAll();
  }

  @Get(':id/file')
  @ApiOperation({ summary: 'PDF-bytes van een handleiding (publiek)' })
  @ApiNotFoundResponse({ description: 'Handleiding niet gevonden' })
  @Header('Cache-Control', 'public, max-age=86400')
  async getFile(@Param('id', ParseUUIDPipe) id: string) {
    const file = await this.handleidingen.getFileBuffer(id);
    return new StreamableFile(file.data, {
      type: file.mimeType,
      disposition: `inline; filename="${file.originalFilename}"`,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Eén handleiding ophalen (publiek)' })
  @ApiNotFoundResponse({ description: 'Handleiding niet gevonden' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleidingen.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file', PDF_UPLOAD))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Handleiding (PDF) uploaden (admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'title'],
      properties: {
        file: { type: 'string', format: 'binary' },
        title: {
          type: 'string',
          example: 'Gebruikershandleiding Haier wandmodel',
        },
        description: {
          type: 'string',
          example: 'Installatie- en gebruiksinstructies.',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Handleiding aangemaakt' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  create(
    @UploadedFile() file: UploadedFilePayload,
    @Body() dto: CreateHandleidingDto,
  ) {
    if (!file) {
      throw new BadRequestException('Geen PDF-bestand ontvangen.');
    }
    return this.handleidingen.create(dto, file);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file', PDF_UPLOAD))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Handleiding bijwerken (admin). PDF is optioneel bij bewerken.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: {
          type: 'string',
          example: 'Gebruikershandleiding Haier wandmodel',
        },
        description: {
          type: 'string',
          example: 'Installatie- en gebruiksinstructies.',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Handleiding bijgewerkt' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: UploadedFilePayload | undefined,
    @Body() dto: UpdateHandleidingDto,
  ) {
    return this.handleidingen.update(id, dto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Handleiding verwijderen (admin)' })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.handleidingen.remove(id);
    return { ok: true };
  }
}

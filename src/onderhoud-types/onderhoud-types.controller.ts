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
import { CreateOnderhoudTypeDto } from './dto/create-onderhoud-type.dto';
import { UpdateOnderhoudTypeDto } from './dto/update-onderhoud-type.dto';
import { OnderhoudTypesService } from './onderhoud-types.service';

@ApiTags('onderhoud-types')
@Controller('onderhoud-types')
export class OnderhoudTypesController {
  constructor(private readonly types: OnderhoudTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Lijst alle onderhoudtypes (publiek)' })
  @ApiOkResponse({ description: 'Onderhoudtypes, op volgorde' })
  findAll() {
    return this.types.findAll();
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

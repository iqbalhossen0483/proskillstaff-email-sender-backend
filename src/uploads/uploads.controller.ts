import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { DeleteFileDto } from '@/uploads/dto/delete-file.dto';
import { UploadsService } from '@/uploads/uploads.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  PayloadTooLargeException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @ApiOperation({
    summary: 'Upload an image to GCS (jpeg / png / webp, max 5 MB)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Returns the public GCS URL' })
  @ApiResponse({ status: 400, description: 'Invalid file or type' })
  @ApiResponse({ status: 413, description: 'File exceeds 5 MB' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('No file provided');
    if (file.size > MAX_FILE_SIZE) {
      throw new PayloadTooLargeException('File must be under 5 MB');
    }
    if (!this.uploadsService.isAllowedMimeType(file.mimetype)) {
      throw new BadRequestException(
        'Only jpeg, png, and webp images are allowed',
      );
    }
    return await this.uploadsService.upload(file);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an image from GCS by its URL' })
  @ApiResponse({ status: 204, description: 'File deleted' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async delete(@Body() dto: DeleteFileDto): Promise<void> {
    await this.uploadsService.delete(dto.url);
  }
}

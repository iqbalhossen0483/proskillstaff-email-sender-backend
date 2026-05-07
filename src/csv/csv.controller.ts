import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import type { ParseEmailsResult } from '@/csv/csv.service';
import { CsvService } from '@/csv/csv.service';
import {
  BadRequestException,
  Controller,
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
const ALLOWED_MIME_TYPES = ['text/csv', 'application/csv', 'text/plain'];

@ApiTags('csv')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Post('parse-emails')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @ApiOperation({
    summary: 'Parse a single-column CSV of email addresses and return the list',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns parsed emails plus totals for valid / invalid / duplicate rows',
  })
  @ApiResponse({ status: 400, description: 'Invalid file or type' })
  @ApiResponse({ status: 413, description: 'File exceeds 5 MB' })
  parseEmails(@UploadedFile() file: Express.Multer.File): ParseEmailsResult {
    if (!file) throw new BadRequestException('No file provided');
    if (file.size > MAX_FILE_SIZE) {
      throw new PayloadTooLargeException('File must be under 5 MB');
    }

    const isCsvName = /\.csv$/i.test(file.originalname ?? '');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype) && !isCsvName) {
      throw new BadRequestException('Only .csv files are allowed');
    }

    return this.csvService.parseEmails(file.buffer);
  }
}

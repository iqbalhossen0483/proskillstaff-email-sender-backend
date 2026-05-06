import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateSendDto } from '@/sends/dto/create-send.dto';
import { SendsService } from '@/sends/sends.service';
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

interface AuthRequest {
  user: { id: number; email: string; role: string };
}

@ApiTags('sends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sends')
export class SendsController {
  constructor(private readonly sendsService: SendsService) {}

  @Post()
  @ApiOperation({ summary: 'Send an email template to a list of recipients' })
  @ApiResponse({ status: 201, description: 'Send queued' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  send(@Body() dto: CreateSendDto, @Request() req: AuthRequest) {
    return this.sendsService.send(dto, req.user.id);
  }
}

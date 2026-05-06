import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  content_json?: Record<string, unknown>;
}

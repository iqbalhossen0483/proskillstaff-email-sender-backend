import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  layout_id!: number;

  @ApiProperty()
  @IsObject()
  content_json!: Record<string, unknown>;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSendDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  template_id!: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsEmail({}, { each: true })
  recipient_emails!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;
}

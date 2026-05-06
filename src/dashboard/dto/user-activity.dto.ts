import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class UserActivityDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

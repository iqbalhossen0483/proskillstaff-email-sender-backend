import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UserRole, UserStatus } from '@/entities/user.entity';

export class ListUsersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

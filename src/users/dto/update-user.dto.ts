import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@/entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

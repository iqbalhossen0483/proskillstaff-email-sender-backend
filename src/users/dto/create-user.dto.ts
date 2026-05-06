import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from '@/entities/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class DeleteFileDto {
  @ApiProperty({
    example: 'https://storage.googleapis.com/my-bucket/uploads/uuid.jpg',
  })
  @IsUrl()
  url!: string;
}

import { Module } from '@nestjs/common';
import { UploadsController } from '@/uploads/uploads.controller';
import { UploadsService } from '@/uploads/uploads.service';

@Module({
  providers: [UploadsService],
  controllers: [UploadsController],
})
export class UploadsModule {}

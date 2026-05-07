import { CsvController } from '@/csv/csv.controller';
import { CsvService } from '@/csv/csv.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [CsvService],
  controllers: [CsvController],
  exports: [CsvService],
})
export class CsvModule {}

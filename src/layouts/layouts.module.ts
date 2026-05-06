import { Layout } from '@/entities/layout.entity';
import { LayoutsController } from '@/layouts/layouts.controller';
import { LayoutsService } from '@/layouts/layouts.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Layout])],
  providers: [LayoutsService],
  controllers: [LayoutsController],
  exports: [LayoutsService],
})
export class LayoutsModule {}

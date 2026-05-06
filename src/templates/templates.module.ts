import { EmailSend } from '@/entities/email-send.entity';
import { EmailTemplate } from '@/entities/email-template.entity';
import { Layout } from '@/entities/layout.entity';
import { TemplatesController } from '@/templates/templates.controller';
import { TemplatesService } from '@/templates/templates.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([EmailTemplate, Layout, EmailSend])],
  providers: [TemplatesService],
  controllers: [TemplatesController],
  exports: [TemplatesService],
})
export class TemplatesModule {}

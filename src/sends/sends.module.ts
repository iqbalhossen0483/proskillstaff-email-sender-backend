import { EmailSend } from '@/entities/email-send.entity';
import { EmailTemplate } from '@/entities/email-template.entity';
import { EmailDispatchProcessor } from '@/sends/email-dispatch.processor';
import { EmailRendererService } from '@/sends/email-renderer.service';
import { SendsController } from '@/sends/sends.controller';
import { SendsService } from '@/sends/sends.service';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate, EmailSend]),
    BullModule.registerQueue({ name: 'email-dispatch' }),
  ],
  providers: [SendsService, EmailRendererService, EmailDispatchProcessor],
  controllers: [SendsController],
  exports: [EmailRendererService],
})
export class SendsModule {}

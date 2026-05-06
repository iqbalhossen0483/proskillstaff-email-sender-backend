import { EmailSend } from '@/entities/email-send.entity';
import { EmailTemplate } from '@/entities/email-template.entity';
import { Layout } from '@/entities/layout.entity';
import { CreateTemplateDto } from '@/templates/dto/create-template.dto';
import { ListTemplatesDto } from '@/templates/dto/list-templates.dto';
import { UpdateTemplateDto } from '@/templates/dto/update-template.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly templateRepo: Repository<EmailTemplate>,
    @InjectRepository(Layout)
    private readonly layoutRepo: Repository<Layout>,
    @InjectRepository(EmailSend)
    private readonly sendRepo: Repository<EmailSend>,
  ) {}

  async create(dto: CreateTemplateDto, userId: number) {
    const layout = await this.layoutRepo.findOne({
      where: { id: dto.layout_id },
    });
    if (!layout)
      throw new NotFoundException(`Layout ${dto.layout_id} not found`);

    const template = this.templateRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      layout_id: dto.layout_id,
      content_json: dto.content_json,
      created_by: userId,
    });
    return this.templateRepo.save(template);
  }

  async findAll(dto: ListTemplatesDto) {
    const qb = this.templateRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.layout', 'layout')
      .where('t.deleted_at IS NULL');

    if (dto.search) {
      qb.andWhere('t.name ILIKE :search', { search: `%${dto.search}%` });
    }
    if (dto.layout_id) {
      qb.andWhere('t.layout_id = :layoutId', { layoutId: dto.layout_id });
    }
    if (dto.created_by) {
      qb.andWhere('t.created_by = :createdBy', { createdBy: dto.created_by });
    }

    const [data, total] = await qb
      .orderBy('t.created_at', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit)
      .getManyAndCount();

    return { data, total, page: dto.page, limit: dto.limit };
  }

  async findOne(id: number) {
    const template = await this.templateRepo.findOne({
      where: { id },
      relations: ['layout'],
    });
    if (!template || template.deleted_at) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    return template;
  }

  async update(id: number, dto: UpdateTemplateDto) {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    return this.templateRepo.save(template);
  }

  async remove(id: number) {
    const template = await this.findOne(id);
    await this.templateRepo.softDelete(template.id);
  }

  async duplicate(id: number, userId: number) {
    const source = await this.findOne(id);
    const copy = this.templateRepo.create({
      name: `Copy of ${source.name}`,
      description: source.description,
      layout_id: source.layout_id,
      content_json: source.content_json,
      send_count: 0,
      created_by: userId,
    });
    return this.templateRepo.save(copy);
  }

  async findSends(templateId: number, page: number, limit: number) {
    await this.findOne(templateId);

    const [data, total] = await this.sendRepo.findAndCount({
      where: { template_id: templateId },
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }
}

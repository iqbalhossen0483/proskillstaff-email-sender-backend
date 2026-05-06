import { Layout } from '@/entities/layout.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LayoutsService {
  constructor(
    @InjectRepository(Layout) private readonly layoutRepo: Repository<Layout>,
  ) {}

  findAll() {
    return this.layoutRepo.find();
  }

  async findOne(id: number) {
    const layout = await this.layoutRepo.findOne({ where: { id } });
    if (!layout) throw new NotFoundException(`Layout ${id} not found`);
    return layout;
  }
}

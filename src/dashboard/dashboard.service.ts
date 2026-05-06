import { UserActivityDto } from '@/dashboard/dto/user-activity.dto';
import { EmailSend, SendStatus } from '@/entities/email-send.entity';
import { EmailTemplate } from '@/entities/email-template.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(EmailSend)
    private readonly sendRepo: Repository<EmailSend>,
    @InjectRepository(EmailTemplate)
    private readonly templateRepo: Repository<EmailTemplate>,
  ) {}

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const [totalAllTime, thisMonth, today] = await Promise.all([
      this.sendRepo.count({ where: { status: SendStatus.SENT } }),
      this.sendRepo
        .createQueryBuilder('s')
        .where('s.status = :status', { status: SendStatus.SENT })
        .andWhere('s.sent_at >= :start', { start: startOfMonth })
        .getCount(),
      this.sendRepo
        .createQueryBuilder('s')
        .where('s.status = :status', { status: SendStatus.SENT })
        .andWhere('s.sent_at >= :start', { start: startOfDay })
        .getCount(),
    ]);

    return { totalAllTime, thisMonth, today };
  }

  async getActivity(days: number) {
    const rows = await this.sendRepo
      .createQueryBuilder('s')
      .select("TO_CHAR(s.sent_at, 'YYYY-MM-DD')", 'date')
      .addSelect('l.slug', 'layoutSlug')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('s.template', 't')
      .innerJoin('t.layout', 'l')
      .where('s.status = :status', { status: SendStatus.SENT })
      .andWhere('s.sent_at >= NOW() - INTERVAL :days', {
        days: `${days} days`,
      })
      .groupBy("TO_CHAR(s.sent_at, 'YYYY-MM-DD'), l.slug")
      .orderBy("TO_CHAR(s.sent_at, 'YYYY-MM-DD')", 'ASC')
      .getRawMany<{ date: string; layoutSlug: string; count: string }>();

    const byDate: Record<
      string,
      { date: string; layoutA: number; layoutB: number }
    > = {};
    for (const row of rows) {
      if (!byDate[row.date])
        byDate[row.date] = { date: row.date, layoutA: 0, layoutB: 0 };
      if (row.layoutSlug === 'layout_a')
        byDate[row.date].layoutA = Number(row.count);
      if (row.layoutSlug === 'layout_b')
        byDate[row.date].layoutB = Number(row.count);
    }

    return Object.values(byDate);
  }

  async getLayoutSplit() {
    const rows = await this.sendRepo
      .createQueryBuilder('s')
      .select('l.slug', 'layoutSlug')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('s.template', 't')
      .innerJoin('t.layout', 'l')
      .where('s.status = :status', { status: SendStatus.SENT })
      .groupBy('l.slug')
      .getRawMany<{ layoutSlug: string; count: string }>();

    const result = { layoutA: 0, layoutB: 0 };
    for (const row of rows) {
      if (row.layoutSlug === 'layout_a') result.layoutA = Number(row.count);
      if (row.layoutSlug === 'layout_b') result.layoutB = Number(row.count);
    }
    return result;
  }

  async getTopTemplates() {
    return this.templateRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.layout', 'layout')
      .where('t.deleted_at IS NULL')
      .orderBy('t.send_count', 'DESC')
      .take(5)
      .select(['t.id', 't.name', 't.send_count', 'layout.slug'])
      .getMany();
  }

  async getRecentSends() {
    return this.sendRepo
      .createQueryBuilder('s')
      .leftJoin('s.template', 't')
      .leftJoin('t.layout', 'l')
      .leftJoin('s.sender', 'u')
      .select([
        't.name AS "templateName"',
        'l.slug AS "layoutSlug"',
        's.recipient_emails AS "recipientEmails"',
        'u.name AS "sentByName"',
        's.sent_at AS "sentAt"',
        's.status AS "status"',
      ])
      .orderBy('s.id', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getUserActivity(dto: UserActivityDto) {
    const qb = this.sendRepo
      .createQueryBuilder('s')
      .leftJoin('s.template', 't')
      .leftJoin('t.layout', 'l')
      .leftJoin('s.sender', 'u')
      .select([
        's.id AS id',
        't.name AS "templateName"',
        'l.slug AS "layoutSlug"',
        's.recipient_emails AS "recipientEmails"',
        'u.name AS "sentByName"',
        's.sent_at AS "sentAt"',
        's.status AS "status"',
      ]);

    if (dto.userId) {
      qb.andWhere('s.sent_by = :userId', { userId: dto.userId });
    }
    if (dto.from) {
      qb.andWhere('s.sent_at >= :from', { from: dto.from });
    }
    if (dto.to) {
      qb.andWhere('s.sent_at <= :to', { to: dto.to });
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('s.id', 'DESC')
      .offset((dto.page - 1) * dto.limit)
      .limit(dto.limit)
      .getRawMany();

    return { data, total, page: dto.page, limit: dto.limit };
  }
}

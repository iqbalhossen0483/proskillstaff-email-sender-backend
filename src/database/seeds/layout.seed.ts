import { Layout } from '@/entities/layout.entity';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Layout],
    synchronize: false,
  });

  await dataSource.initialize();
  const repo = dataSource.getRepository(Layout);

  const layouts = [
    {
      slug: 'layout_a',
      name: 'Layout A — Outreach',
      description:
        'Team-focused outreach email with member cards and profile photos.',
    },
    {
      slug: 'layout_b',
      name: 'Layout B — Announcement',
      description: 'Announcement email with a highlights list.',
    },
  ];

  for (const layout of layouts) {
    await repo.upsert(layout, { conflictPaths: ['slug'] });
    console.log(`Seeded layout: ${layout.slug}`);
  }

  await dataSource.destroy();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

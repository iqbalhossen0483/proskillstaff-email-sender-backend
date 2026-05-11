import { Layout } from '@/entities/layout.entity';
import { User, UserRole, UserStatus } from '@/entities/user.entity';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, Layout],
    synchronize: false,
  });

  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);
  const layoutRepo = dataSource.getRepository(Layout);

  const user = await userRepo.findOneBy({
    email: 'admin@gmail.com',
  });
  if (!user) {
    const newUser = userRepo.create({
      name: 'Iqbal Hossen',
      email: 'admin@gmail.com',
      password_hash:
        '$2a$12$S3Vee/cjrZnLvn8h6o9s2O1meMFd4Vv6JZbXA/mZfWBoynEc85Po.',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    });

    await userRepo.save(newUser);
  }
  const layouts = [
    {
      slug: 'layout_a',
      name: 'Layout A',
      description: 'A clean and modern layout with a focus on readability.',
    },
    {
      slug: 'layout_b',
      name: 'Layout B',
      description:
        'A vibrant and dynamic layout designed to capture attention.',
    },
  ];

  for (const layoutData of layouts) {
    const existing = await layoutRepo.findOneBy({ slug: layoutData.slug });
    if (!existing) {
      const layout = layoutRepo.create(layoutData);
      await layoutRepo.save(layout);
    }
  }

  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

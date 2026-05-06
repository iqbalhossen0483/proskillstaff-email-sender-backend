import { User, UserRole, UserStatus } from '@/entities/user.entity';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();
  const repo = dataSource.getRepository(User);

  const user = await repo.findOneBy({ email: 'iqbalhossen60483@gmail.com' });
  if (user) throw new Error('User already exists');

  const newUser = repo.create({
    name: 'Iqbal Hossen',
    email: 'iqbalhossen60483@gmail.com',
    password_hash:
      '$2a$12$uuSEE/lLBPXgWZ6unK6R8u6lf/XGFMFDx1oQXW9SLWIDB5D25uKWu',
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
  });

  await repo.save(newUser);

  await dataSource.destroy();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

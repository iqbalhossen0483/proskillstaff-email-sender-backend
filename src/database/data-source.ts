import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});

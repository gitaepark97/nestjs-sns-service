import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Environment } from './env.validation';

export const databaseConfig = registerAs(
  'database',
  () =>
    <TypeOrmModuleOptions>{
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT!),
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
      synchronize: process.env.NODE_ENV !== Environment.Production,
      log: process.env.NODE_ENV === Environment.Development,
      dropSchema: process.env.NODE_ENV === Environment.Test,
    },
);

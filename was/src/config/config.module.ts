import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule, ConfigType } from "@nestjs/config";
import { validate } from "./env.validation";
import { serverConfig } from "./server.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseConfig } from "./database.config";

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: `${__dirname}/env/.env.${process.env.NODE_ENV}`,
      validate: validate,
      load: [serverConfig, databaseConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => config,
    }),
  ],
})
export class ConfigModule {}

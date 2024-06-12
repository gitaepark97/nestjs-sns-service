import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  validateSync,
} from "class-validator";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumberString()
  PORT: string;

  @IsNotEmpty()
  MYSQL_HOST: string;
  @IsNumberString()
  MYSQL_PORT: string;
  @IsNotEmpty()
  MYSQL_USERNAME: string;
  @IsNotEmpty()
  MYSQL_PASSWORD: string;
  @IsNotEmpty()
  MYSQL_DATABASE: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};

import { utilities, WinstonModule } from "nest-winston";
import { Environment } from "src/config/env.validation";
import winston from "winston";
import WinstonDaily from "winston-daily-rotate-file";

const dailyOption = (level: string) => {
  return {
    level,
    datePattern: "YYYY-MM-DD",
    dirname: `./logs/${level}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 30,
    format: winston.format.combine(
      winston.format.timestamp(),
      utilities.format.nestLike(process.env.NODE_ENV, {
        colors: false,
        prettyPrint: true,
      }),
    ),
  };
};

const transports =
  process.env.NODE_ENV === Environment.Production
    ? [
        new WinstonDaily(dailyOption("info")),
        new WinstonDaily(dailyOption("warn")),
        new WinstonDaily(dailyOption("error")),
      ]
    : [
        new winston.transports.Console({
          level: "debug",
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike(process.env.NODE_ENV, {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        new WinstonDaily(dailyOption("info")),
        new WinstonDaily(dailyOption("warn")),
        new WinstonDaily(dailyOption("error")),
      ];

export const winstonLogger = WinstonModule.createLogger({
  transports: transports,
});

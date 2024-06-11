import { utilities, WinstonModule } from "nest-winston";
import { Environment } from "src/config/env.validation";
import winston from "winston";
import WinstonDaily from "winston-daily-rotate-file";

const generateFormat = (isConsole: boolean) =>
  winston.format.combine(
    winston.format.timestamp(),
    utilities.format.nestLike(process.env.NODE_ENV, {
      colors: isConsole,
      prettyPrint: true,
    }),
  );

const dailyOption = (level: string) => {
  return {
    level,
    datePattern: "YYYY-MM-DD",
    dirname: `./logs/${level}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 30,
    format: generateFormat(false),
  };
};

const dailyOptions = [
  new WinstonDaily(dailyOption("info")),
  new WinstonDaily(dailyOption("warn")),
  new WinstonDaily(dailyOption("error")),
];

const transports =
  process.env.NODE_ENV === Environment.Production
    ? dailyOptions
    : [
        new winston.transports.Console({
          level: "debug",
          format: generateFormat(true),
        }),
        ...dailyOptions,
      ];

export const winstonLogger = WinstonModule.createLogger({
  transports,
});

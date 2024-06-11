import {
  Global,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
} from "@nestjs/common";
import { winstonLogger } from "./winston-logger";
import { Environment } from "../../config/env.validation";
import { LoggingMiddleware } from "./logging.middleware";

@Global()
@Module({
  providers: [{ provide: Logger, useValue: winstonLogger }],
  exports: [Logger],
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    if (process.env.NODE_ENV !== Environment.Test) {
      consumer.apply(LoggingMiddleware).forRoutes("*");
    }
  }
}

import {
  Global,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
} from "@nestjs/common";
import { Environment } from "../config/env.validation";
import { LoggingMiddleware } from "./logging/logging.middleware";
import { winstonLogger } from "./logging/winston.logger";

@Global()
@Module({
  providers: [{ provide: Logger, useValue: winstonLogger }],
  exports: [Logger],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    if (process.env.NODE_ENV !== Environment.Test) {
      consumer.apply(LoggingMiddleware).forRoutes("*");
    }
  }
}

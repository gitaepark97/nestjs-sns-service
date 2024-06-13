import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(request: Request, response: Response, next: NextFunction) {
    const start = Date.now();

    response.on("finish", () => {
      this.logger.log(
        `${request.method} ${request.originalUrl} ${response.statusCode} ${request.ip} ${request.get("user-agent")} - ${Date.now() - start}ms`,
      );
    });

    next();
  }
}

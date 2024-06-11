import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

const isUnexpectedError = (exception: Error) =>
  exception instanceof HttpException;

const generateLogMessage = (
  request: Request,
  status: number,
  exception: Error,
) =>
  `${request.method} ${request.originalUrl} ${status} ${request.ip} ${request.get("user-agent")} - ${exception.message}`;

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // handling unexpected error
    const [status, message] = isUnexpectedError(exception)
      ? [(<HttpException>exception).getStatus(), exception.message]
      : [
          HttpStatus.INTERNAL_SERVER_ERROR,
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ];

    // logging
    isUnexpectedError(exception)
      ? this.logger.warn(generateLogMessage(request, status, exception))
      : this.logger.error(
          generateLogMessage(request, status, exception),
          exception.stack,
        );

    response.status(status).json({
      timestamp: new Date(),
      path: request.path,
      message,
    });
  }
}

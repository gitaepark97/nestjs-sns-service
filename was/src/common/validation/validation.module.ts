import { Module } from "@nestjs/common";
import { RequestValidationPipe } from "./request-validation.pipe";
import { APP_PIPE } from "@nestjs/core";

@Module({
  providers: [{ provide: APP_PIPE, useClass: RequestValidationPipe }],
})
export class ValidationModule {}

import { Module } from "@nestjs/common";
import { LoggingModule } from "./logging/logging.module";
import { HealthModule } from "./health/health.module";
import { ExceptionModule } from "./exception/exception.module";
import { ValidationModule } from "./validation/validation.module";

@Module({
  imports: [HealthModule, LoggingModule, ExceptionModule, ValidationModule],
})
export class CommonModule {}

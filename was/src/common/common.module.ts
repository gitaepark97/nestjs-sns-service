import { Module } from "@nestjs/common";
import { LoggingModule } from "./logging/logging.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [HealthModule, LoggingModule],
})
export class CommonModule {}

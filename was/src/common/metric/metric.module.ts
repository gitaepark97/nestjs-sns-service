import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { MetricMiddleware } from "./metric.middleware";

@Module({
  imports: [PrometheusModule.register()],
})
export class MetricModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(MetricMiddleware).exclude("metrics/*");
  }
}

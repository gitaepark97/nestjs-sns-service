import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { serverConfig } from "./config/server.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = app.get(serverConfig.KEY).port;
  await app.listen(PORT);
}

bootstrap().then();

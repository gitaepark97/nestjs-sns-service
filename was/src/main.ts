import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { serverConfig } from "./config/server.config";
import { VersioningType } from "@nestjs/common";
import { setUpSwagger } from "./common/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("/api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  setUpSwagger(app);

  const PORT = app.get(serverConfig.KEY).port;
  await app.listen(PORT);
}

bootstrap().then();

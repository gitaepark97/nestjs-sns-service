import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Environment } from "src/config/env.validation";

export const setUpSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle("SNS 서비스")
    .setDescription(
      `SNS 서비스 ${process.env.NODE_ENV == Environment.Production ? "운영" : "개발"} 환경 API 문서입니다.`,
    )
    .setVersion("1.0.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api/docs", app, document);
};

export const generateErrorExample = (path: string, message: string) => ({
  timestamp: "0000-00-00T00:00:00.000Z",
  path: "/api" + path,
  message,
});

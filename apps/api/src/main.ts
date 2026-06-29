import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 5000);

  app.enableCors({
    origin: configService.get<string>("WEB_ORIGIN", "http://localhost:3000"),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Dworven Shaft API")
    .setDescription("HTTP API for authentication, profiles, guilds, and chat history. Realtime chat events are served over the Socket.IO chat namespace.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, swaggerDocument, {
    customSiteTitle: "Dworven Shaft API Docs",
  });

  await app.listen(port);
  Logger.log(`API is running on http://localhost:${port}`, "Bootstrap");
  Logger.log(`Swagger docs are available on http://localhost:${port}/docs`, "Bootstrap");
}

void bootstrap();

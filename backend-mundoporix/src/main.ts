import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('port') ?? 3000;
  const apiPrefix = config.get<string>('apiPrefix') ?? 'api/v1';
  const corsOrigin = config.get<string>('corsOrigin') ?? '*';

  app.setGlobalPrefix(apiPrefix);
  app.use(helmet());
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MundoPórix API')
    .setDescription(
      'Backend MundoPórix — cadena de negocio: Producto → Stock → Cotización → Reserva → Preparación → Recogida',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`API lista en http://localhost:${port}/${apiPrefix}`);
  console.log(`Documentación: http://localhost:${port}/api/docs`);
}

void bootstrap();

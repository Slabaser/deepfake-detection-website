import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Deepfake Detection API')
    .setDescription('Deepfake Tespit Platformu API Dokümantasyonu')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('analysis')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 5001);

  logger.log(
    `🚀 Uygulama şu adreste çalışıyor: http://localhost:${process.env.PORT || 5001}`,
  );
  logger.log(
    `📝 Swagger dökümantasyonu: http://localhost:${process.env.PORT || 5001}/api/docs`,
  );
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(helmet());

  app.enableCors({
    origin: isProd ? frontendUrl || false : '*',
    methods: 'GET,POST,DELETE',
    credentials: true,
    maxAge: 3600,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();

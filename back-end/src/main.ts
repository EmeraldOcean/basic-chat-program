import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3101",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"], // 프론트엔드에서 Authorization 헤더를 읽을 수 있도록
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }))  // filter에서 undefined 오류 생길 때 추가

  await app.listen(process.env.PORT ?? 3100);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3100}`);
}
bootstrap();

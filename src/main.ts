import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { VersioningType } from '@nestjs/common';
import { PrismaClientFilter } from './prisma/prisma.filter.js';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalFilters(new PrismaClientFilter());
  app.setGlobalPrefix('api', {
    exclude: ['health', 'docs', 'metrics'],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  await app.listen(process.env.PORT ?? 3900);
}
bootstrap();

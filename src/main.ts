import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import {
  SwaggerDocumentOptions,
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  };
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:8081'], // Adjust this to match the frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  });

  const config = new DocumentBuilder()
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .setTitle('User Service Documentation')
    .setDescription('The User Service Documentation API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000, '0.0.0.0');
}
bootstrap();

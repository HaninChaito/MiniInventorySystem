import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './products/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- THIS IS THE FIX ---
  // Define an array of allowed origins.
  const allowedOrigins = [
    'http://localhost:3000', // Your local React dev server
    'https://d2l0dprhnfskai.cloudfront.net', // Your deployed frontend
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the incoming origin is in our list
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  });  

 /* const app = await NestFactory.create(AppModule);
    app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });*/


  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

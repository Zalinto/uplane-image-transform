import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ImageModule } from './image/image.module';
import { HealthModule } from './health/health.module';
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 300000,
        limit: 1,
      },
    ]),
    ImageModule,
    HealthModule,
  ],
  controllers: [],
  providers: [ConfigService],
})
export class AppModule {}

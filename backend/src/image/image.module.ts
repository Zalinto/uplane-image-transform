import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { BackgroundRemovalService } from './services/background-removal.service';
import { ImageProcessingService } from './services/image-processing.service';
import { StorageService } from './services/storage.service';
import { ConfigModule } from '@nestjs/config';
import { PageIdGuard } from '../common/guards/page-id.guard';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  ],
  controllers: [ImageController],
  providers: [
    ImageService,
    BackgroundRemovalService,
    ImageProcessingService,
    StorageService,
    PageIdGuard,
    ConfigService,
  ],
  exports: [ConfigService],
})
export class ImageModule {}

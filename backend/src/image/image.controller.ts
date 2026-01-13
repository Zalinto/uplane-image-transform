import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { ProcessedImageResponseDto } from '../dto/process-image-response.dto';
import { DeleteImageDto } from '../dto/delete-image.dto';
import { UploadImageDto } from '../dto/upload-image.dto';
import { GetAllImagesResponseDto } from '../dto/list-images-response.dto';
import { PageIdGuard } from '../common/guards/page-id.guard';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  async getAllImages(): Promise<GetAllImagesResponseDto> {
    const images = await this.imageService.getAllImages();
    return { images };
  }

  @Post('upload')
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @UseGuards(PageIdGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ): Promise<ProcessedImageResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    const result = await this.imageService.processImage(
      file,
      uploadImageDto.pageId,
    );

    return {
      id: result.id,
      url: result.url,
      createdAt: result.createdAt,
    };
  }

  @Delete('delete')
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  async deleteImage(@Body() deleteImageDto: DeleteImageDto): Promise<void> {
    await this.imageService.deleteImage(deleteImageDto.id);
  }
}

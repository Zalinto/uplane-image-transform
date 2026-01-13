import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { ProcessedImageResponseDto } from '../dto/process-image-response.dto';
import { DeleteImageDto } from '../dto/delete-image.dto';
import { UploadImageDto } from '../dto/upload-image.dto';
import { GetAllImagesResponseDto } from '../dto/list-images-response.dto';
import { ImageRecordDto } from '../dto/image-record.dto';
import { ConfigService } from '../config/config.service';

@Controller('image')
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async getAllImages(): Promise<GetAllImagesResponseDto> {
    const images = await this.imageService.getAllImages();
    return { images };
  }

  @Post('upload')
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ): Promise<ProcessedImageResponseDto> {
    // Validate pageId after body is parsed
    const allowedPageId = this.configService.get<string>('ALLOWED_PAGE_ID');
    if (allowedPageId && uploadImageDto.pageId !== allowedPageId) {
      throw new BadRequestException('Invalid pageId');
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

  @Get('records')
  async getAllImageRecords(): Promise<GetAllImagesResponseDto> {
    const records = await this.imageService.getAllImages();
    return {
      images: records.map((r) => ({
        id: r.id,
        url: r.url,
        createdAt: r.createdAt,
        originalUrl: r.originalUrl,
      })),
    };
  }

  @Get('records/:id')
  async getImageRecord(@Param('id') id: string): Promise<ImageRecordDto> {
    const image = await this.imageService.getImageById(id);

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return {
      id: image.id,
      original_path: image.originalUrl,
      processed_path: image.url,
      page_id: null,
      created_at: image.createdAt,
      updated_at: image.createdAt,
    };
  }

  @Delete('records/:id')
  async deleteImageRecord(@Param('id') id: string): Promise<void> {
    const image = await this.imageService.getImageById(id);

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.imageService.deleteImageRecord(id);
  }
}

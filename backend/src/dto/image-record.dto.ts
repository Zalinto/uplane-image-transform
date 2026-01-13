import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  original_path: string;

  @IsString()
  @IsNotEmpty()
  processed_path: string;

  @IsString()
  @IsOptional()
  page_id?: string;
}

export class ImageRecordDto {
  id: string;

  original_path: string;

  processed_path: string;

  page_id: string | null;

  created_at: Date;

  updated_at: Date;
}

export class GetAllImagesResponseDto {
  images: ImageRecordDto[];
}

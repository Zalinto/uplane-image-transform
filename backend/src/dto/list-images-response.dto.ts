import { IsArray, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class ListImagesResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsDateString()
  createdAt: Date;
}

export class GetAllImagesResponseDto {
  @IsArray()
  images: ListImagesResponseDto[];
}

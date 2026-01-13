import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class ProcessedImageResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsDateString()
  createdAt: Date;
}

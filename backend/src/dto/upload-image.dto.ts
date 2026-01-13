import { IsUUID, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadImageDto {
  @IsUUID()
  @IsOptional()
  @Transform(({ value }) => (value ? value : undefined))
  pageId?: string;
}

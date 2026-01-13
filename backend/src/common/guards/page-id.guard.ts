import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class PageIdGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const body = request.body as { pageId?: string };
    const allowedPageId = this.configService.get<string>('ALLOWED_PAGE_ID');

    if (body.pageId !== allowedPageId) {
      throw new BadRequestException('Invalid pageId');
    }

    return true;
  }
}

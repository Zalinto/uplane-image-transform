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
    const body = request.body as { pageId?: string } | undefined;
    const allowedPageId = this.configService.get<string>('ALLOWED_PAGE_ID');

    console.log('allowedPageId', allowedPageId);
    // Allow if no pageId is configured (development mode)
    if (!allowedPageId) {
      return true;
    }

    const pageId = body?.pageId;

    console.log('pageId', pageId);
    console.log('allowedPageId', allowedPageId);
    if (pageId !== allowedPageId) {
      throw new BadRequestException('Invalid pageId');
    }

    return true;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService extends NestConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    super();
    this.validateEnvVars([
      'REMOVE_BG_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'ALLOWED_PAGE_ID',
    ]);
  }

  private validateEnvVars(requiredVars: string[]): void {
    const missingVars = requiredVars.filter((varName) => !this.get(varName));

    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables: ${missingVars.join(
        ', ',
      )}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    this.logger.log('All required environment variables are set');
  }
}

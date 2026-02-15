import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateShortUrlDto } from './dtos/create-short-url.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { I18nContext } from 'nestjs-i18n';
import { IsAuthenticatedGuard } from '../auth/guards/is-authenticated.guard';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  @UseGuards(IsAuthenticatedGuard)
  async createShortUrl(
    @Body() dto: CreateShortUrlDto,
    @GetUser('userId') userId: string,
  ) {
    const i18n = I18nContext.current<I18nTranslations>();
    const url = await this.urlService.createShortUrl(dto.originalUrl, userId);
    return { message: i18n?.t('translation.url.created'), data: url };
  }

  @Get(':shortCode')
  @Redirect()
  async redirectToOriginalUrl(@Param('shortCode') shortCode: string) {
    const originalUrl = await this.urlService.getOriginalUrl(shortCode);
    return {
      url: originalUrl,
      statusCode: HttpStatus.PERMANENT_REDIRECT,
    };
  }
}

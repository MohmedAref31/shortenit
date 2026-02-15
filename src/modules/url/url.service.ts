import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Url, UrlDocument } from './models/url.model';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class UrlService {
  constructor(
    @InjectModel(Url.name) private readonly urlModel: Model<UrlDocument>,
  ) {}

  async checkShortCodeExists(shortCode: string): Promise<boolean> {
    const existingUrl = await this.urlModel.findOne({ shortCode });
    return !!existingUrl;
  }

  async createShortUrl(originalUrl: string, userId: string): Promise<Url> {
    let shortCode = nanoid(8);
    while (await this.checkShortCodeExists(shortCode)) {
      shortCode = nanoid(8);
    }
    const url = new this.urlModel({ originalUrl, shortCode, userId });
    return url.save();
  }

  async getOriginalUrl(shortCode: string): Promise<string> {
    const i18n = I18nContext.current<I18nTranslations>();
    const url = await this.urlModel.findOne({ shortCode });
    if (!url) {
      throw new NotFoundException(i18n?.t('translation.url.notFound'));
    }
    // TODO: Implement click tracking and analytics here
    return url.originalUrl;
  }
}

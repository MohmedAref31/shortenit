import { IsUrl } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';

export class CreateShortUrlDto {
  @IsUrl(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'translation.url.invalid',
      ),
    },
  )
  originalUrl: string;
}

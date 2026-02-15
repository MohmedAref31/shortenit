import { IsEmail, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';

export class LoginDto {
  @IsEmail(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'translation.validation.email',
      ),
    },
  )
  email: string;

  @IsString()
  password: string;
}

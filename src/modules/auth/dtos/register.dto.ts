import { IsEmail, IsStrongPassword } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';

export class RegisterDto {
  @IsEmail(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'translation.validation.email',
      ),
    },
  )
  email: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message: i18nValidationMessage<I18nTranslations>(
        'translation.validation.strongPassword',
      ),
    },
  )
  password: string;
}

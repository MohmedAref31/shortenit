import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const i18n = I18nContext.current<I18nTranslations>();
    await this.authService.register(dto);
    return { message: i18n?.t('translation.auth.register.success') };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const i18n = I18nContext.current<I18nTranslations>();
    const data = await this.authService.login(dto);
    return { message: i18n?.t('translation.auth.login.success'), data };
  }
}

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterDto } from './dtos/register.dto';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const i18n = I18nContext.current<I18nTranslations>();
    const isExistedUser = await this.userModel.findOne({
      email: dto.email,
    });
    if (isExistedUser) {
      throw new ConflictException(
        i18n?.t('translation.auth.register.emailExists'),
      );
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      ...dto,
      password: hashedPassword,
    });
    await user.save();
    return user;
  }

  async login(dto: LoginDto) {
    const i18n = I18nContext.current<I18nTranslations>();
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user) {
      throw new UnauthorizedException(
        i18n?.t('translation.auth.login.invalidCredentials') ||
          'Invalid email or password',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        i18n?.t('translation.auth.login.invalidCredentials') ||
          'Invalid email or password',
      );
    }

    const payload = { sub: user._id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}

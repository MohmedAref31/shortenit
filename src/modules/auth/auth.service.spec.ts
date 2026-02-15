import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserDocument } from '../user/models/user.model';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { I18nContext } from 'nestjs-i18n';

jest.mock('bcrypt');
jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let userModel: jest.Mocked<Model<UserDocument>>;
  let jwtService: jest.Mocked<JwtService>;
  let mockI18n: jest.Mocked<I18nContext<any>>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(true),
  } as unknown as UserDocument;

  const mockRegisterDto: RegisterDto = {
    email: 'test@example.com',
    password: 'Password123!',
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'Password123!',
  };

  beforeEach(async () => {
    mockI18n = {
      t: jest.fn().mockReturnValue('translated message'),
    } as unknown as jest.Mocked<I18nContext<any>>;

    (I18nContext.current as jest.Mock).mockReturnValue(mockI18n);

    const mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      (userModel.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.register(mockRegisterDto);

      // Assert
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: mockRegisterDto.email,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
      expect(userModel.create).toHaveBeenCalledWith({
        ...mockRegisterDto,
        password: 'hashedPassword123',
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const existingUser = { ...mockUser };
      (userModel.findOne as jest.Mock).mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: mockRegisterDto.email,
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('should use i18n translation when email exists', async () => {
      // Arrange
      const existingUser = { ...mockUser };
      (userModel.findOne as jest.Mock).mockResolvedValue(existingUser);
      mockI18n.t.mockReturnValue('Email already exists');

      // Act & Assert
      try {
        await service.register(mockRegisterDto);
        fail('Should have thrown ConflictException');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(mockI18n.t).toHaveBeenCalledWith(
          'translation.auth.register.emailExists',
        );
      }
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const token = 'jwt-token-123';
      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue(token);

      // Act
      const result = await service.login(mockLoginDto);

      // Assert
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: mockLoginDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser._id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        accessToken: token,
        user: {
          id: mockUser._id,
          email: mockUser.email,
          createdAt: mockUser.createdAt,
        },
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: mockLoginDto.email,
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should use i18n translation when user is not found', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      mockI18n.t.mockReturnValue('Invalid email or password');

      // Act & Assert
      try {
        await service.login(mockLoginDto);
        fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(mockI18n.t).toHaveBeenCalledWith(
          'translation.auth.login.invalidCredentials',
        );
      }
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: mockLoginDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should use i18n translation when password is invalid', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockI18n.t.mockReturnValue('Invalid email or password');

      // Act & Assert
      try {
        await service.login(mockLoginDto);
        fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(I18nContext.current).toHaveBeenCalled();
        expect(mockI18n.t).toHaveBeenCalledWith(
          'translation.auth.login.invalidCredentials',
        );
      }
    });

    it('should return fallback message when i18n context is not available', async () => {
      // Arrange - Reset mock and set to return undefined, then create new service
      (I18nContext.current as jest.Mock).mockReset();
      (I18nContext.current as jest.Mock).mockReturnValue(undefined);

      const mockUserModelWithoutI18n = {
        findOne: jest.fn(),
        create: jest.fn(),
      };

      const mockJwtServiceWithoutI18n = {
        signAsync: jest.fn(),
      };

      const moduleWithoutI18n: TestingModule =
        await Test.createTestingModule({
          providers: [
            AuthService,
            {
              provide: getModelToken(User.name),
              useValue: mockUserModelWithoutI18n,
            },
            {
              provide: JwtService,
              useValue: mockJwtServiceWithoutI18n,
            },
          ],
        }).compile();

      const serviceWithoutI18n =
        moduleWithoutI18n.get<AuthService>(AuthService);
      (mockUserModelWithoutI18n.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      try {
        await serviceWithoutI18n.login(mockLoginDto);
        fail('Should have thrown UnauthorizedException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid email or password');
      }
    });

    it('should handle bcrypt.hash rejection during registration', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(
        new Error('Bcrypt hash failed'),
      );

      // Act & Assert
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Bcrypt hash failed',
      );
    });

    it('should handle user creation failure during registration', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      (userModel.create as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle jwtService.signAsync failure during login', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockRejectedValue(
        new Error('JWT signing failed'),
      );

      // Act & Assert
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        'JWT signing failed',
      );
    });
  });
});

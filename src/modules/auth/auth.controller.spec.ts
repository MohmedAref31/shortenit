import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { I18nContext } from 'nestjs-i18n';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    // Mock I18nContext.current() before controller instantiation
    jest.spyOn(I18nContext, 'current').mockReturnValue({
      t: jest.fn().mockReturnValue('Success'),
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AuthController', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('register', () => {
    it('should call authService.register with the provided DTO', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      authService.register.mockResolvedValue(undefined);

      await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should return a success message', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      authService.register.mockResolvedValue(undefined);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('message');
      expect(result.message).toBeDefined();
    });

    it('should handle errors from authService.register', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const error = new Error('Registration failed');
      authService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(
        'Registration failed',
      );
    });
  });

  describe('login', () => {
    it('should call authService.login with the provided DTO', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const loginResult = {
        accessToken: 'jwt-token-xyz',
        user: { id: '1', email: 'test@example.com' },
      };
      authService.login.mockResolvedValue(loginResult);

      await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should return a success message with login data', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const loginResult = {
        accessToken: 'jwt-token-xyz',
        user: { id: '1', email: 'test@example.com' },
      };
      authService.login.mockResolvedValue(loginResult);

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(loginResult);
    });

    it('should return the login data from authService', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const loginResult = {
        accessToken: 'jwt-token-xyz',
        user: { id: '1', email: 'test@example.com' },
      };
      authService.login.mockResolvedValue(loginResult);

      const result = await controller.login(loginDto);

      expect(result.data).toEqual(loginResult);
      expect(result.data.accessToken).toBe('jwt-token-xyz');
      expect(result.data.user.id).toBe('1');
    });

    it('should handle errors from authService.login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});

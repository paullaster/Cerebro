import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Res,
  Req,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login-auth.dto.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { UsernameGeneratorPipe } from '../common/pipes/username-generator.pipe.js';
import { Response, Request } from 'express';
import { ConfigService } from '../config/config.service.js';
import { AUTH_CONSTANTS, SECURE_COOKIE_ALLOW_LIST } from './auth.constants.js';

@Controller({
  version: '1',
})
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @UsePipes(
    new UsernameGeneratorPipe(),
    new ValidationPipe({ transform: true }),
  )
  async register(@Body() createAuthDto: CreateUserDto) {
    return await this.authService.register(createAuthDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const { accessToken, refreshToken, userId } =
      await this.authService.login(loginDto);

    this.setRefreshCookie(response, request, refreshToken);

    return {
      accessToken,
      userId,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const oldRefreshToken = request.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME];
    
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { accessToken, refreshToken, userId } =
      await this.authService.refresh(oldRefreshToken);

    this.setRefreshCookie(response, request, refreshToken);

    return {
      accessToken,
      userId,
    };
  }

  @Get('session')
  async getSession(@Req() request: Request) {
    const refreshToken = request.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME];
    
    if (!refreshToken) {
      throw new UnauthorizedException('No active session');
    }

    // You can also validate the Access Token here if you have a Guard.
    // For this specific endpoint, we verify if the user is still "logged in".
    const { accessToken, userId } = await this.authService.refresh(refreshToken);
    const user = await this.authService.validateSession(userId); // Simplified logic
    
    return user;
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    // In a real implementation, you'd extract the sessionId from the JWT Access Token
    // For now, we clear the cookie.
    response.clearCookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME);
    return { message: 'Logged out' };
  }

  private setRefreshCookie(response: Response, request: Request, token: string) {
    const host = request.get('host') || '';
    const isSecureDomain = SECURE_COOKIE_ALLOW_LIST.some(domain => host.includes(domain));
    const isProduction = this.configService.isProduction;

    response.cookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction || isSecureDomain,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
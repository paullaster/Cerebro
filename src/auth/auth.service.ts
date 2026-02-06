import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login-auth.dto.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../prisma/redis.service.js';
import { ConfigService } from '../config/config.service.js';
import { AUTH_CONSTANTS } from './auth.constants.js';
import { uuidv7 } from 'uuidv7';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const userRecord = await this.prisma.users.findFirst({
      where: {
        OR: [{ email: loginDto.username }, { phone_number: loginDto.username }],
      },
    });

    if (!userRecord) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      userRecord.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createSession(userRecord.id);
  }

  async createSession(userId: string) {
    const sessionId: string = uuidv7();
    const sessionKey = `${AUTH_CONSTANTS.SESSION_PREFIX}${sessionId}`;

    // Store session in Redis with 15-minute TTL
    await this.redisService.set(
      sessionKey,
      JSON.stringify({ userId, createdAt: new Date() }),
      900, // 15 minutes
    );

    const payload = { sub: userId, sid: sessionId };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.jwtSecret,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    });

    return {
      accessToken,
      refreshToken,
      userId,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      });

      const sessionKey = `${AUTH_CONSTANTS.SESSION_PREFIX}${payload.sid}`;
      const sessionExists = await this.redisService.exists(sessionKey);

      // If session token is expired in Redis but refresh token is still valid,
      // we can allow the rotation as long as we trust the refresh token.
      // However, for "reliable session", we strictly follow the Redis lifecycle.
      // If the session is gone from Redis, the user must log in again.
      if (!sessionExists) {
        throw new UnauthorizedException('Session expired');
      }

      // Rotate: Delete old session, create new one
      await this.redisService.del(sessionKey);
      return this.createSession(payload.sub);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateSession(sessionId: string) {
    const sessionKey = `${AUTH_CONSTANTS.SESSION_PREFIX}${sessionId}`;
    const sessionData = await this.redisService.get(sessionKey);

    if (!sessionData) {
      return null;
    }

    const { userId } = JSON.parse(sessionData);
    return this.userService.findOne(userId);
  }

  async logout(sessionId: string) {
    const sessionKey = `${AUTH_CONSTANTS.SESSION_PREFIX}${sessionId}`;
    await this.redisService.del(sessionKey);
  }

  // Keep existing register if needed, but updated to use proper entity
  async register(createUserDto: any) {
    // Implementation for registration logic
  }
}

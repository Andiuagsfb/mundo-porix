import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { hashToken } from './utils/hash-token';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { $Enums } from '../generated/prisma/client';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findAuthUserByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokenPair(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roleName: user.role.name,
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.usersService.findAuthUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const currentHash = hashToken(refreshToken);
    if (!user.refreshToken || user.refreshToken !== currentHash) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    return this.generateTokenPair(user);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
  }

  async profile(user: AuthUser) {
    return this.usersService.findById(user.id);
  }

  private async generateTokenPair(user: {
    id: string;
    email: string;
    fullName: string;
    role: { name: $Enums.RoleName };
  }): Promise<TokenPair> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      roleName: user.role.name,
      type: 'access',
    };

    const refreshPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      roleName: user.role.name,
      type: 'refresh',
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.config.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: this.config.getOrThrow<string>(
        'jwt.accessExpiresIn',
      ) as JwtSignOptions['expiresIn'],
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: this.config.getOrThrow<string>(
        'jwt.refreshExpiresIn',
      ) as JwtSignOptions['expiresIn'],
    });

    await this.usersService.saveRefreshToken(user.id, hashToken(refreshToken));

    return { accessToken, refreshToken };
  }
}

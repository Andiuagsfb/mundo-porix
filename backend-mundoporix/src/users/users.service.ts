import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  buildPaginationResult,
  getPaginationParams,
} from '../common/utils/pagination';
import { $Enums } from '../generated/prisma/client';

const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  isActive: true,
  role: { select: { name: true } },
  createdAt: true,
  updatedAt: true,
} as const;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

const authUserSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  isActive: true,
  passwordHash: true,
  refreshToken: true,
  role: { select: { name: true } },
} as const;

export type AuthUserRecord = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const roleName = dto.role ?? $Enums.RoleName.SELLER;
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });
    if (!role) {
      throw new NotFoundException('El rol seleccionado no existe');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        phone: dto.phone,
        passwordHash,
        roleId: role.id,
        isActive: dto.isActive ?? true,
      },
      select: publicUserSelect,
    });
  }

  async findAll(page?: number, limit?: number, search?: string) {
    const {
      page: safePage,
      limit: safeLimit,
      skip,
    } = getPaginationParams(page, limit);

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: publicUserSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginationResult(data, total, safePage, safeLimit);
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: publicUserSelect,
    });
  }

  async findAuthUserByEmail(email: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: authUserSelect,
    });
  }

  async findAuthUserById(id: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: authUserSelect,
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    await this.findById(id);

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email.toLowerCase(), id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
    }

    const data: Prisma.UserUpdateInput = {
      email: dto.email?.toLowerCase(),
      fullName: dto.fullName,
      phone: dto.phone,
      isActive: dto.isActive,
    };

    if (dto.role) {
      const role = await this.prisma.role.findUnique({
        where: { name: dto.role },
      });
      if (!role) {
        throw new NotFoundException('El rol seleccionado no existe');
      }
      data.role = { connect: { id: role.id } };
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findAuthUserById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new ConflictException('La contraseña actual es incorrecta');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async setActive(id: string, isActive: boolean): Promise<PublicUser> {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: publicUserSelect,
    });
  }

  async saveRefreshToken(id: string, refreshTokenHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { refreshToken: refreshTokenHash },
    });
  }

  async clearRefreshToken(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { refreshToken: null },
    });
  }
}

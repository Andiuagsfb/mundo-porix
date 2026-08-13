import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { slugify } from '../common/utils/slugify';

@Injectable()
export class SeasonsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSeasonDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (startDate >= endDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    const slug = slugify(dto.name);
    const existing = await this.prisma.season.findFirst({
      where: { OR: [{ name: dto.name }, { slug }] },
    });
    if (existing) {
      throw new ConflictException('Ya existe una temporada con ese nombre');
    }

    return this.prisma.season.create({
      data: {
        name: dto.name,
        slug,
        startDate,
        endDate,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(activeOnly = false) {
    return this.prisma.season.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { startDate: 'asc' },
      include: { _count: { select: { productSeasons: true } } },
    });
  }

  async findById(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      include: {
        productSeasons: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true },
            },
          },
        },
      },
    });
    if (!season) {
      throw new NotFoundException('Temporada no encontrada');
    }
    return season;
  }

  async update(id: string, dto: UpdateSeasonDto) {
    await this.findById(id);

    const data: {
      name?: string;
      slug?: string;
      startDate?: Date;
      endDate?: Date;
      isActive?: boolean;
    } = {
      isActive: dto.isActive,
    };

    if (dto.name) {
      data.name = dto.name;
      data.slug = slugify(dto.name);
    }

    const season = await this.prisma.season.findUnique({ where: { id } });
    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : season?.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : season?.endDate;
    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }
    if (dto.startDate) {
      data.startDate = startDate;
    }
    if (dto.endDate) {
      data.endDate = endDate;
    }

    return this.prisma.season.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.season.delete({ where: { id } });
    return { deleted: true };
  }

  async addProducts(id: string, productIds: string[]) {
    const season = await this.findById(id);

    const uniqueIds = [...new Set(productIds)];
    const count = await this.prisma.product.count({
      where: { id: { in: uniqueIds } },
    });
    if (count !== uniqueIds.length) {
      throw new BadRequestException('Uno o más productos no existen');
    }

    const existing = await this.prisma.productSeason.findMany({
      where: { seasonId: id, productId: { in: uniqueIds } },
      select: { productId: true },
    });
    const existingIds = new Set(existing.map((e) => e.productId));
    const toCreate = uniqueIds.filter((pid) => !existingIds.has(pid));

    if (toCreate.length > 0) {
      await this.prisma.productSeason.createMany({
        data: toCreate.map((productId) => ({ seasonId: id, productId })),
        skipDuplicates: true,
      });
    }

    return this.findById(season.id);
  }

  async removeProducts(id: string, productIds: string[]) {
    await this.findById(id);
    await this.prisma.productSeason.deleteMany({
      where: { seasonId: id, productId: { in: productIds } },
    });
    return this.findById(id);
  }
}

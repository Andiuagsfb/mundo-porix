import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { slugify } from '../common/utils/slugify';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBrandDto) {
    const slug = slugify(dto.name);
    const existing = await this.prisma.brand.findFirst({
      where: { OR: [{ name: dto.name }, { slug }] },
    });
    if (existing) {
      throw new ConflictException('Ya existe una marca con ese nombre');
    }

    return this.prisma.brand.create({
      data: { name: dto.name, slug },
    });
  }

  async findAll() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async findById(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findById(id);

    if (dto.name) {
      const slug = slugify(dto.name);
      const existing = await this.prisma.brand.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Ya existe una marca con ese nombre');
      }
      return this.prisma.brand.update({
        where: { id },
        data: { name: dto.name, slug },
      });
    }

    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    const productCount = await this.prisma.product.count({
      where: { brandId: id },
    });
    if (productCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la marca porque tiene productos asociados',
      );
    }
    await this.prisma.brand.delete({ where: { id } });
    return { deleted: true };
  }
}

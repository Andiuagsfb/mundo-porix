import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { slugify } from '../common/utils/slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name);
    const existing = await this.prisma.category.findFirst({
      where: { OR: [{ name: dto.name }, { slug }] },
    });
    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);

    const data: Prisma.CategoryUpdateInput = {
      description: dto.description,
    };
    if (dto.name) {
      const slug = slugify(dto.name);
      const existing = await this.prisma.category.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
      data.name = dto.name;
      data.slug = slug;
    }

    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la categoría porque tiene productos asociados',
      );
    }
    await this.prisma.category.delete({ where: { id } });
    return { deleted: true };
  }
}

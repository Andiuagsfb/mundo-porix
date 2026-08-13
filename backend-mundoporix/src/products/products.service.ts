import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { slugify } from '../common/utils/slugify';
import {
  buildPaginationResult,
  getPaginationParams,
} from '../common/utils/pagination';

const productInclude = {
  category: true,
  brand: true,
  inventory: true,
  productSeasons: {
    select: { season: true },
  },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export function withAvailability(product: ProductWithRelations) {
  const { inventory, ...rest } = product;
  return {
    ...rest,
    availableQuantity: inventory
      ? inventory.quantity - inventory.reservedQuantity
      : 0,
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const [brand, category] = await Promise.all([
      this.prisma.brand.findUnique({ where: { id: dto.brandId } }),
      this.prisma.category.findUnique({ where: { id: dto.categoryId } }),
    ]);
    if (!brand) {
      throw new NotFoundException('La marca no existe');
    }
    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    const slug = await this.uniqueSlug(slugify(dto.name));

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          price: dto.price,
          imageUrl: dto.imageUrl,
          isActive: dto.isActive ?? true,
          brandId: dto.brandId,
          categoryId: dto.categoryId,
        },
        include: productInclude,
      });

      if (dto.initialStock !== undefined && dto.initialStock > 0) {
        await tx.inventory.create({
          data: {
            productId: product.id,
            quantity: dto.initialStock,
            reservedQuantity: 0,
          },
        });
      }

      return product;
    });
  }

  async findAll(query: ProductQueryDto, activeOnly = false) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.ProductWhereInput = {
      isActive: activeOnly
        ? true
        : query.includeInactive === 'true'
          ? undefined
          : true,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.brandId) {
      where.brandId = query.brandId;
    }
    if (query.seasonId) {
      where.productSeasons = { some: { seasonId: query.seasonId } };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginationResult(
      rows.map(withAvailability),
      total,
      page,
      limit,
    );
  }

  async findById(id: string) {
    const product = await this.findEntity(id);
    if (!product.isActive) {
      throw new NotFoundException('Producto no encontrado');
    }
    return withAvailability(product);
  }

  private async findEntity(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    if (!product || !product.isActive) {
      throw new NotFoundException('Producto no encontrado');
    }
    return withAvailability(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findEntity(id);

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
      });
      if (!brand) {
        throw new NotFoundException('La marca no existe');
      }
    }
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('La categoría no existe');
      }
    }

    const data: Prisma.ProductUpdateInput = {
      name: dto.name,
      description: dto.description,
      price: dto.price,
      imageUrl: dto.imageUrl,
      isActive: dto.isActive,
      brand: dto.brandId ? { connect: { id: dto.brandId } } : undefined,
      category: dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : undefined,
    };

    if (dto.name) {
      data.slug = await this.uniqueSlug(slugify(dto.name), id);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: productInclude,
    });

    return withAvailability(product);
  }

  async remove(id: string) {
    await this.findEntity(id);
    await this.prisma.product.delete({ where: { id } });
    return { deleted: true };
  }

  async validateProductsExist(ids: string[]): Promise<void> {
    const distinctIds = [...new Set(ids)];
    const count = await this.prisma.product.count({
      where: { id: { in: distinctIds }, isActive: true },
    });
    if (count !== distinctIds.length) {
      throw new BadRequestException(
        'Uno o más productos no existen o están inactivos',
      );
    }
  }

  private async uniqueSlug(
    baseSlug: string,
    ignoreId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let suffix = 2;
    for (;;) {
      const existing = await this.prisma.product.findFirst({
        where: { slug, id: ignoreId ? { not: ignoreId } : undefined },
        select: { id: true },
      });
      if (!existing) {
        return slug;
      }
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }
}

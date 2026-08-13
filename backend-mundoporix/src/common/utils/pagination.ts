export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function getPaginationParams(
  page?: number,
  limit?: number,
): { page: number; limit: number; skip: number } {
  const safePage = Math.max(page ?? 1, 1);
  const safeLimit = Math.min(Math.max(limit ?? 10, 1), 100);
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export function buildPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginationResult<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

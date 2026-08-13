import { SetMetadata } from '@nestjs/common';
import { $Enums } from '../../generated/prisma/client';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: $Enums.RoleName[]) =>
  SetMetadata(ROLES_KEY, roles);

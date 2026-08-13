import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { $Enums } from '../../generated/prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roleName: $Enums.RoleName;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    return request.user as AuthUser;
  },
);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export type AuthenticatedUser = {
  userId: string;
  email: string;
};

export const GetUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();

    if (!data) {
      return request.user;
    }

    return request.user?.[data];
  },
);

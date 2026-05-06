import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: Error,
    user: TUser,
    info: { message?: string },
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException(info?.message ?? 'Unauthorized');
    }
    return user;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

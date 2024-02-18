import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  throwUnauthorized() {
    const message = ['You are not authorized to access this resource'];
    throw new UnauthorizedException(
      { message, statusCode: 401, error: 'Unauthorized' },
      'Unauthorized'
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.throwUnauthorized();
    }

    try {
      const payload = await this.authService.validateToken(token);

      // Assign the user information to the request
      request['user'] = payload;
    } catch {
      this.throwUnauthorized();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

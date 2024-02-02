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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      const message = ['You are not authorized to access this resource'];
      throw new UnauthorizedException(
        { message, statusCode: 401, error: 'Unauthorized' },
        'Unauthorized'
      );
    }

    try {
      console.log('token', token);
      const payload = await this.authService.validateToken(token);

      // Assign the user information to the request
      request['user'] = payload;
    } catch {
      const message = ['You are not authorized to access this resource'];
      throw new UnauthorizedException(
        { message, statusCode: 401, error: 'Unauthorized' },
        'Unauthorized'
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

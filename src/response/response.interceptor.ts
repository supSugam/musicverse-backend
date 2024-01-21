import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),
      catchError((err: HttpException) =>
        throwError(() => this.errorHandler(err, context))
      )
    );
  }

  errorHandler(
    exception: HttpException | Prisma.PrismaClientKnownRequestError,
    context: ExecutionContext
  ) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception instanceof Prisma.PrismaClientKnownRequestError
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      status: false,
      statusCode: status,
      path: request.url,
      message:
        exception instanceof Prisma.PrismaClientKnownRequestError
          ? this.extractPrismaErrorMessage(exception)
          : exception.message,
      result: exception,
    });
  }

  private extractPrismaErrorMessage(
    error: Prisma.PrismaClientKnownRequestError
  ): string {
    // Extract error message from Prisma error
    let errMsg = error.meta?.cause;
    if (typeof errMsg === 'string') {
      return errMsg;
    }
    return 'Unknown, Check Prisma error object.';
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const statusCode = response.statusCode;

    return {
      status: true,
      path: request.url,
      statusCode,
      result: res,
    };
  }
}

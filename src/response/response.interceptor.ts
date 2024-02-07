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
    exception: HttpException | Prisma.PrismaClientKnownRequestError | Error,
    context: ExecutionContext
  ) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const isPrismaClientKnownRequestError =
      exception instanceof Prisma.PrismaClientKnownRequestError;
    const isHttpException = exception instanceof HttpException;
    const isError = exception instanceof Error;

    const status = isHttpException
      ? exception.getStatus()
      : isPrismaClientKnownRequestError
        ? HttpStatus.BAD_REQUEST
        : isError
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;

    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      path: request.url,
      statusCode,
      message: isPrismaClientKnownRequestError
        ? this.extractPrismaErrorMessage(exception)
        : isHttpException || isError
          ? this.extractErrorMessage(exception)
          : 'Internal Server Error',
      ...(isPrismaClientKnownRequestError && {
        code: exception.code,
        meta: exception.meta,
      }),
      success: false,
    });
  }

  private extractPrismaErrorMessage(
    error: Prisma.PrismaClientKnownRequestError
  ): string[] {
    // Extract error message from Prisma error
    let errMsg = error.meta?.cause;
    if (typeof errMsg !== 'string') {
      errMsg = 'Unknown, Check Prisma error object.';
    } else {
      errMsg = errMsg.replace(/\n/g, ' ').replace(/  +/g, ' ');
    }
    return [errMsg as string];
  }

  private extractErrorMessage(error: HttpException | Error): string[] {
    let messages = [];

    if (error instanceof HttpException) {
      const response = error.getResponse() as any;

      if (response) {
        if (response.message) {
          if (typeof response.message === 'string') {
            messages.push(response.message);
          } else if (Array.isArray(response.message)) {
            messages.push(...response.message);
          }
        }
        if (typeof response === 'string') {
          messages.push(response);
        }
      } else {
        messages.push('No error message available');
      }
    } else {
      messages.push(error.message);
    }

    return messages;
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    return {
      path: request.url,
      success: true,
      statusCode: res.statusCode || HttpStatus.OK,
      result: res,
    };
  }
}

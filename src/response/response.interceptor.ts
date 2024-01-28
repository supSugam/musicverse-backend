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
    const isPrismaClientKnownRequestError =
      exception instanceof Prisma.PrismaClientKnownRequestError;
    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : isPrismaClientKnownRequestError
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      path: request.url,
      statusCode: statusCode,
      message: isPrismaClientKnownRequestError
        ? this.extractPrismaErrorMessage(exception)
        : this.extractErrorMessage(exception),
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

  private extractErrorMessage(error: HttpException): string[] {
    const response = error.getResponse() as any;
    const messages = [];
    if (typeof response.message === 'string') {
      messages.push(response.message);
    } else {
      messages.push(...response.message);
    }
    response;
    return messages;
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    console.log(res);
    return {
      path: request.url,
      success: true,
      statusCode: res.statusCode || HttpStatus.OK,
      result: res,
    };
  }
}

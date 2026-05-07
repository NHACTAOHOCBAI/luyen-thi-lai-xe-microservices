import {
  Catch,
  type ArgumentsHost,
  type ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { DomainException } from '@repo/common';

const STATUS_BY_CODE: Record<string, number> = {
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  UNSUPPORTED_CLIENT: HttpStatus.BAD_REQUEST,
  MULTI_ROLE_VIOLATION: HttpStatus.FORBIDDEN,
  IDENTITY_USER_NOT_FOUND: HttpStatus.NOT_FOUND,
};

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status = STATUS_BY_CODE[exception.code] ?? HttpStatus.BAD_REQUEST;

    response.status(status).json({
      success: false,
      code: exception.code,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
    });
  }
}

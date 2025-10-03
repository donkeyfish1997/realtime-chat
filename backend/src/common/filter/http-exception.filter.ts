import {
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      if (zodError instanceof ZodError) {
        const message = zodError.issues
          .map((issue) => {
            return `${issue.path.toString()}: ${issue.message}`;
          })
          .toString();

        super.catch(new BadRequestException(message), host);
        return;
      }
    }

    super.catch(exception, host);
  }
}

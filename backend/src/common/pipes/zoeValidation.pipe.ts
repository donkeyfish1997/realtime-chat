import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodError, ZodObject } from 'zod';

@Injectable()
export class ZoeValidation implements PipeTransform {
  constructor(private readonly zodSchema: ZodObject) {}
  transform(value: unknown, metadata: ArgumentMetadata): any {
    try {
      return this.zodSchema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(
            (issue) => `[error key: ${issue.path.join('.')}] ${issue.message}`,
          )
          .join('|');
        throw new BadRequestException(errorMessage);
      }
      throw new BadRequestException('Validation failed');
    }
  }
}

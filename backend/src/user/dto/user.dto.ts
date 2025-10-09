import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const userSchema = z.object({
  email: z.email(),
  name: z.string(),
  id: z.string(),
  emailVerified: z.coerce.string().nullable(),
  image: z.url().nullable(),
});
export class UserDto extends createZodDto(userSchema) {}

const updateUserBaseInfoSchema = z.object({
  name: z.string().nullable(),
  image: z.string().nullable(),
});

export class UpdateUserBaseInfoDto extends createZodDto(
  updateUserBaseInfoSchema,
) {}
export class UpdateUserBaseInfoResposneDto extends createZodDto(userSchema) {}

export class SearchUserQueryDto extends createZodDto(
  z.object({ query: z.string() }),
) {}
export class SearchUserQueryResDto extends createZodDto(
  z.array(
    z.object({ id: z.string(), name: z.string(), image: z.url().nullable() }),
  ),
) {}

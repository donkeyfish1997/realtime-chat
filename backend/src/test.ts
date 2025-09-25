import * as z from 'zod';
import { ZodError } from 'zod';

const a = z.object({ a: z.string(), b: z.uint32() }).required();
try {
  const b = a.parse({ a: 123 });
  //   console.log(b);
} catch (error) {
  if (error instanceof ZodError) {
    console.log(error.issues);
    // console.log(error.name);
  }
}

// import { SetMetadata } from '@nestjs/common';

// export const IS_PUBLIC_KEY = 'isPublic';
// export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

import { Reflector } from '@nestjs/core';

export const Public = Reflector.createDecorator<boolean>({
  transform: (value: boolean | undefined): boolean => {
    if (value === undefined) {
      return true;
    }
    return value;
  },
});

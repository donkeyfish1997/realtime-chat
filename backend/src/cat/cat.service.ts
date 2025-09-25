import { Injectable } from '@nestjs/common';
import { Cat } from './interface/cat.interface';

@Injectable()
export class CatService {
  // constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: any) {} //@Optional 找不到也行，@Inject value or Factory inject

  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(options?: { age?: number; breed?: string }): Cat[] {
    console.log(options);
    return this.cats;
  }
}

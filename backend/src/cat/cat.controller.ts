import {
  Body,
  Controller,
  Get,
  // HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
  // UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { HttpRedirectResponse } from '@nestjs/common';
import { createCatSchema } from './dto/create-cat.dto';
import type { CreateCatDto } from './dto/create-cat.dto';
import { CatService } from './cat.service';
import { ZoeValidation } from 'src/common/pipes/zoeValidation.pipe';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/filters/roles.decorator';

@UseGuards(RolesGuard)
@Controller('cat')
export class CatController {
  constructor(private catService: CatService) {}
  @Get('getRequest')
  //   @HttpCode(222)
  //@Header('Cache-Control', 'no-store')
  getRequest(@Req() req: Request) {
    const reqInfo = {
      req_params: req.params,
      req_body: req.body as object,
      req_query: req.query,
      req_ip: req.ip,
      req_hosts: req.host,
      req_headers: req.headers,
    } as { [k in string]: any };
    return reqInfo;
  }
  @Get()
  findAll(
    @Query('age', new ParseIntPipe({ optional: true })) age?: number,
    @Query('breed') breed?: string,
  ) {
    return this.catService.findAll({ age, breed });
  }
  @Get(':id')
  findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): string {
    return `This action returns a id ${id}`;
  }
  @Post()
  @Roles(['admin'])
  create(
    @Body(new ZoeValidation(createCatSchema)) createCatDto: CreateCatDto,
  ): string {
    this.catService.create(createCatDto);
    return 'This action adds a new cat';
  }
  @Redirect('http://localhost:3000', 302)
  @Get('redirect')
  redirect(): HttpRedirectResponse {
    return { url: 'http://localhost:3000', statusCode: 303 }; //over write
  }

  @Get('/*path')
  routeTest(@Res() res: Response) {
    // not recommand use response
    res.status(HttpStatus.OK).send('you are in router path test path');
  }
}

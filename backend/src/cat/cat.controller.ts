import {
  Body,
  Controller,
  Get,
  // HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { HttpRedirectResponse } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cat')
export class CatController {
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
  findAll(@Query('age') age: number, @Query('breed') breed: string) {
    return `This action returns all cats filtered by age: ${age}-${typeof age} and breed: ${breed}-${typeof breed}`;
  }
  @Get(':id/:id2')
  findOne(@Param() params: { id: string; id2: string }): string {
    //@Param('id') id: string
    return `This action returns a #${params.id} #${params.id2} cat`;
  }
  @Post('createCat')
  //@Get(), @Post(), @Put(), @Delete(), @Patch(), @Options(), and @Head(). In addition, @All() defines an endpoint that handles all of them.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(@Body() createCatDto: CreateCatDto): string {
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

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { UsernameGeneratorPipe } from '../common/pipes/username-generator.pipe.js';
import { QueryUserDto } from './dto/query-user.dto.js';

@Controller({
  version: '1',
})
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @UsePipes(
    new UsernameGeneratorPipe(),
    new ValidationPipe({ transform: true }),
  )
  create(@Body() createUserDto: User) {
    return this.usersService.create(createUserDto);
  }

  @Get('all')
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

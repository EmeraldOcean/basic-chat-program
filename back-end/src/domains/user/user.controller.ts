import { Controller, Post, Body, Get, Delete, UseGuards, Patch, Res, Req } from '@nestjs/common';
import type { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import { FilterUserDto } from './dto/filter-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtServiceAuthGuard } from '../auth/jwt/jwt-service.guard';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(
  private readonly service: UserService,
  ) {}

  // 모든 사용자 목록
  @Get()
  @UseGuards(JwtServiceAuthGuard)
  async getUsers(@Body() filterDto : FilterUserDto) {
    const userLists = await this.service.getUsers(filterDto);
    return userLists;
  };

  // 사용자 정보
  @Get('info')
  @UseGuards(JwtServiceAuthGuard)
  async getUserInfo(@Req() req) {
    const user = await this.service.getUserBySeqId(req.user.seqId);
    const result = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    return result;
  };

  // 회원가입
  @Post('signup')
  async createUser(@Body() createUserDto: CreateUserDto){
    const user = await this.service.createUser(createUserDto);
    const result = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    return result;
  };

  // 로그인
  @Post('login')
  async login(@Body() loginDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.login(loginDto);
    res.setHeader('Authorization', `Bearer ${result.accessToken}`);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return result;
  };
  
  // 로그아웃
  @Post('logout')
  @UseGuards(JwtServiceAuthGuard)
  async logout(@Req() req) {
    const authCookies = req.cookies;
    if (authCookies.refreshToken) {
      const result = await this.service.removeRefreshToken(authCookies.refreshToken);
      return result;
    }
  };

  // 사용자 정보 수정
  @Patch('info')
  @UseGuards(JwtServiceAuthGuard)
  async updateUser(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto) {
    const result = await this.service.updateUser(req.user.seqId, updateUserDto);
    return result;
  };

  // Access Token 재발급
  @Patch('update-token')
  async updateToken(@Req() req, @Res({ passthrough: true }) res: Response) {
    const authCookies = req.cookies;
    if (authCookies.refreshToken) {
      const accessToken = await this.service.updateAccessToken(authCookies.refreshToken);
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      return { message: 'Access token updated' };
    }
    return { message: 'Refresh token not found' };
  };

  // 사용자 탈퇴
  @Delete('soft-delete')
  @UseGuards(JwtServiceAuthGuard)
  async softDeleteUser(@Req() req) {
    const result = await this.service.softDeleteUser(req.user.seqId);
    return result;
  };
}
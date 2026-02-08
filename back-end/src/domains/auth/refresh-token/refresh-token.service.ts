import { Logger, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from 'src/domains/user/entity/user.entity';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { plainToInstance } from 'class-transformer';
import { SECRET_KEY, ACCESS_EXPIRES, REFRESH_EXPIRES } from '../../../config/auth.config';
import { FilterRefreshTokenDto } from './dto/filter-refresh-token.dto';
import ms from 'ms';

@Injectable()
export class RefreshTokenService {
    private readonly logger = new Logger(RefreshTokenService.name)
    constructor(
    private repository: RefreshTokenRepository,
    private jwtService: JwtService,
  ) {}

  // access Token 발급
  async generateAccessToken(users: User) {
    const payload = {
      seqId: users.seq_id,
      userId: users.user_id,
      email: users.email};
      
    const accessToken = await this.jwtService.signAsync(payload, {secret: SECRET_KEY, expiresIn: ACCESS_EXPIRES});
    return accessToken;
  }

  // refresh token 발급
  async generateRefreshToken(users: User) {
    const payload = {
      seqId: users.seq_id,
      userId: users.user_id};

    // Refresh Token 만료 시간 계산
    const refreshToken = await this.jwtService.signAsync(payload, {secret: SECRET_KEY, expiresIn: REFRESH_EXPIRES});
    const currentDate = new Date();
    const expiresDate = new Date(currentDate.getTime() + ms(REFRESH_EXPIRES));

    // DB에 Refresh Token 저장
    const createRefreshToken = plainToInstance(CreateRefreshTokenDto, {
      refreshToken: refreshToken,
      expiresDate: expiresDate,
      userSeqId: users.seq_id
    })

    await this.repository.createRefreshToken(users, createRefreshToken);

    return refreshToken;
  }

  // access token 재발급
  async refreshAccessToken(refreshToken: string): Promise<string> {
    // DB에서 refresh token 갖는 데이터 찾기
    const resultToken = await this.validRefreshToken(refreshToken)

    // refresh token이 아직 완료 안 됐다면, access token 새로 발급
    const payload = {
      seqId: resultToken.user.seq_id,
      userId: resultToken.user.user_id,
      email: resultToken.user.email};

    const newAccessToken = await this.jwtService.signAsync(payload, {secret: SECRET_KEY, expiresIn: ACCESS_EXPIRES});
    return newAccessToken;
  }

  // 로그아웃 시 auth 삭제
  async removeAuth(refreshToken: string) : Promise<boolean> {
    return await this.repository.deleteRefreshToken(refreshToken)
  }


  // refresh Token 체크
  async validRefreshToken(refreshToken: string): Promise<RefreshToken> {
    const filterDto = new FilterRefreshTokenDto();
    filterDto.refreshToken = refreshToken;
    const tokenUser = await this.repository.getFilteredOne({filter: filterDto})
    if (!tokenUser) {
      this.logger.warn('Invalid refresh token.');
      throw new NotFoundException('Invalid refresh token.');
    }
    if (refreshToken != tokenUser.refresh_token) {
      this.logger.warn('Refresh token does not match.');
      throw new ForbiddenException('Refresh token does not match.')
    }

    // refresh token이 만료되었는지 확인
    if (new Date() > tokenUser.expires_date) {
      await this.repository.deleteRefreshToken(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }
    return tokenUser;
  }
}
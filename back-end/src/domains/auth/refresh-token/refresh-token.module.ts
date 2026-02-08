import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../jwt/jwt.strategy';
import { JwtRefreshStrategy } from '../jwt/refresh.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule,
    PassportModule,
  ],
  providers: [RefreshTokenService,
    RefreshTokenRepository,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [RefreshTokenService]
})
export class RefreshTokenModule {}
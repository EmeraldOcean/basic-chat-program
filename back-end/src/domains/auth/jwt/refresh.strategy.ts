import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy} from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RefreshTokenService } from "../refresh-token/refresh-token.service";
import { SECRET_KEY } from "../../../config/auth.config";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly refreshTokenService: RefreshTokenService) {
    super({
      secretOrKey: SECRET_KEY,
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => { 
        const token = request.headers['refreshToken'];
        return token ? token : null;}]),
      passReqToCallback: true
    });
  }
  async validate(request: Request, payload: any) {
    const refreshToken = request.headers['refreshToken'];
    if (typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.refreshTokenService.validRefreshToken(refreshToken);
  }
}
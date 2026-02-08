import { Injectable } from "@nestjs/common";
import { PassportStrategy} from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SECRET_KEY } from "../../../config/auth.config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      secretOrKey: SECRET_KEY,
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }
  async validate(payload: any) {
    return {
      seqId: payload.seqId,
      userId: payload.userId,
      email: payload.email,
      name: payload.name
    };
  }
}
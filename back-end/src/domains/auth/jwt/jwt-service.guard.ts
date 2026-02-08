import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DEBUG_JWT_ENABLED } from "../../../config/auth.config";

@Injectable()
export class JwtServiceAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    if (DEBUG_JWT_ENABLED) {
      return true;
    } else {
      return super.canActivate(context);
    }
  }
}
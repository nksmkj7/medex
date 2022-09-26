import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as config from 'config';

import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret')
    });
  }

  async validate(payload: JwtPayloadDto) {
    const { subject } = payload;
    if (!subject) {
      throw new UnauthorizedException();
    }
    return { customerId: subject };
  }
}

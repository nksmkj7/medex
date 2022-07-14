import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ProviderService } from './provider.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtTwoFactorStrategy } from 'src/common/strategy/jwt-two-factor.strategy';
import { JwtStrategy } from 'src/common/strategy/jwt.strategy';
import * as Redis from 'ioredis';
import * as config from 'config';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const throttleConfig = config.get('throttle.login');
const redisConfig = config.get('queue');
const LoginThrottleFactory = {
  provide: 'LOGIN_THROTTLE',
  useFactory: () => {
    const redisClient = new Redis({
      enableOfflineQueue: false,
      host: process.env.REDIS_HOST || redisConfig.host,
      port: process.env.REDIS_PORT || redisConfig.port,
      password: process.env.REDIS_PASSWORD || redisConfig.password
    });

    return new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: throttleConfig.prefix,
      points: throttleConfig.limit,
      duration: 60 * 60 * 24 * 30, // Store number for 30 days since first fail
      blockDuration: throttleConfig.blockDuration
    });
  }
};

@Module({
  controllers: [ProviderController],
  providers: [
    ProviderService,
    AuthService,
    JwtTwoFactorStrategy,
    JwtStrategy,
    LoginThrottleFactory
  ]
})
export class ProviderModule extends AuthModule {}

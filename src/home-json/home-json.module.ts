import { Module } from '@nestjs/common';
import { HomeJsonService } from './home-json.service';
import { HomeJsonController } from './home-json.controller';

@Module({
  providers: [HomeJsonService],
  controllers: [HomeJsonController]
})
export class HomeJsonModule {}

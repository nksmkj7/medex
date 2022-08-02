import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuController } from './menu.controller';
import { MenuRepository } from './menu.repository';
import { MenuService } from './menu.service';

@Module({
  imports: [TypeOrmModule.forFeature([MenuRepository])],
  controllers: [MenuController],
  providers: [MenuService]
})
export class MenuModule {}

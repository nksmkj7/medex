import { DynamicModule, Module } from '@nestjs/common';
import * as Omise from 'omise';
import { OmiseService } from './omise.service';

@Module({})
export class OmiseModule {
  static register(options: Omise.IOptions): DynamicModule {
    const { publicKey, secretKey } = options;
    const omise = Omise({
      publicKey,
      secretKey
    });
    return {
      module: OmiseModule,
      providers: [
        OmiseService,
        {
          provide: 'OMISE_CLIENT',
          useValue: omise
        }
      ],
      exports: [OmiseService],
      global: true
    };
  }
}

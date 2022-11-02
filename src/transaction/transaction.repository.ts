import { EntityRepository } from 'typeorm';

import { BaseRepository } from 'src/common/repository/base.repository';

import { TransactionEntity } from './entity/transaction.entity';
import { TransactionSerializer } from './transaction.serializer';

@EntityRepository(TransactionEntity)
export class TransactionRepository extends BaseRepository<
  TransactionEntity,
  TransactionSerializer
> {}

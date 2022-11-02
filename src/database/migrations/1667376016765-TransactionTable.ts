import { TransactionStatusEnum } from 'src/booking/enums/transaction-status.enum';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class TransactionTable1667376016765 implements MigrationInterface {
  tableName = 'transactions';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'bookingId',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'customerId',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'price',
            type: 'decimal',
            default: 0,
            precision: 12,
            scale: 4
          },
          {
            name: 'discount',
            type: 'decimal',
            default: 0,
            precision: 5,
            scale: 2
          },
          {
            name: 'serviceCharge',
            type: 'decimal',
            default: 0,
            precision: 12,
            scale: 4
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            default: 0,
            precision: 12,
            scale: 4
          },
          {
            name: 'transactionCode',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              TransactionStatusEnum.FAILED,
              TransactionStatusEnum.PAID,
              TransactionStatusEnum.UNPAID
            ],
            default: `'${TransactionStatusEnum.UNPAID}'`
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()'
          }
        ],
        foreignKeys: [
          {
            name: 'Booking',
            columnNames: ['bookingId'],
            referencedTableName: 'bookings',
            referencedColumnNames: ['id']
          },
          {
            name: 'Customer',
            columnNames: ['customerId'],
            referencedTableName: 'customers',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'IDX_' + this.tableName + '_bookingId',
            columnNames: ['bookingId']
          },
          {
            name: 'IDX_' + this.tableName + '_customerId',
            columnNames: ['customerId']
          }
        ],
        uniques: [
          {
            columnNames: ['customerId', 'transactionCode']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}

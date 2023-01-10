import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class BookingInitiationLogsTable1673281645004
  implements MigrationInterface
{
  tableName = 'booking_initiation_logs';

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
            name: 'bookingData',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'transactionData',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'bookingCreated',
            type: 'boolean',
            default: false
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
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}

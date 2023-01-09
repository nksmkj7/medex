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
            name: 'customerId',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'scheduleId',
            type: 'varchar',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'scheduleDate',
            type: 'date',
            isNullable: false
          },
          {
            name: 'serviceStartTime',
            type: 'time',
            isNullable: true
          },
          {
            name: 'serviceEndTime',
            type: 'time',
            isNullable: true
          },
          {
            name: 'firstName',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'lastName',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'phone',
            type: 'varchar',
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
        ],
        foreignKeys: [
          {
            name: 'Customer',
            columnNames: ['customerId'],
            referencedTableName: 'customers',
            referencedColumnNames: ['id']
          },
          {
            name: 'Schedule',
            columnNames: ['scheduleId'],
            referencedTableName: 'schedules',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'IDX_' + this.tableName + '_customerId',
            columnNames: ['customerId']
          },
          {
            name: 'IDX_' + this.tableName + '_scheduleId',
            columnNames: ['scheduleId']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}

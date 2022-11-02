import { BookingStatusEnum } from 'src/booking/enums/booking-status.enum';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class BookingTable1667373908859 implements MigrationInterface {
  tableName = 'bookings';
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
            name: 'status',
            type: 'enum',
            enum: [
              BookingStatusEnum.CONFIRMED,
              BookingStatusEnum.PROCESSING,
              BookingStatusEnum.DELIVERED,
              BookingStatusEnum.PENDING
            ],
            default: `'${BookingStatusEnum.PENDING}'`
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

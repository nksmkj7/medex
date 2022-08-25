import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ServiceSpecialistSchedulesTable1661308787708
  implements MigrationInterface
{
  tableName = 'schedules';
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
            name: 'serviceId',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'specialistId',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'date',
            type: 'date',
            isNullable: false
          },
          {
            name: 'schedules',
            type: 'jsonb'
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
            columnNames: ['serviceId'],
            referencedTableName: 'services',
            referencedColumnNames: ['id']
          },
          {
            columnNames: ['specialistId'],
            referencedTableName: 'specialists',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
          {
            name: 'IDX_' + this.tableName + '_serviceId',
            columnNames: ['serviceId']
          },
          {
            name: 'IDX_' + this.tableName + '_specialistId',
            columnNames: ['specialistId']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}

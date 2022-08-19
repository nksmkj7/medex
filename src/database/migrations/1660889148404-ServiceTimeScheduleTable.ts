import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ServiceTimeScheduleTable1660889148404
  implements MigrationInterface
{
  tableName = 'service_specialist';
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
            name: 'status',
            type: 'boolean',
            default: true
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
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['specialistId'],
            referencedTableName: 'specialists',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ],
        indices: [
          {
            columnNames: ['serviceId']
          },
          {
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

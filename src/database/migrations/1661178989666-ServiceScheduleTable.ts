import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ServiceScheduleTable1661178989666 implements MigrationInterface {
  tableName = 'service_schedules';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'service_id',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'date',
            type: 'date',
            isNullable: false
          },
          {
            name: 'schedules',
            type: 'jsonb',
            default: []
          },
          {
            name: 'createAt',
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

import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createHomeJsonTable1680542077864 implements MigrationInterface {
  tableName = 'home_json';
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
            name: 'title',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'slug',
            type: 'varchar'
          },
          {
            name: 'position',
            type: 'int'
          },
          {
            name: 'sectionIcon',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'startTime',
            type: 'date',
            isNullable: true
          },
          {
            name: 'expiryTime',
            type: 'date',
            isNullable: true
          },
          {
            name: 'moduleType',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'content',
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
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}

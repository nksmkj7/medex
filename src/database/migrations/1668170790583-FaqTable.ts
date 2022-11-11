import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class FaqTable1668170790583 implements MigrationInterface {
  tableName = 'faqs';

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
            name: 'question',
            type: 'text',
            isNullable: false
          },
          {
            name: 'answer',
            type: 'text',
            isNullable: false
          },
          {
            name: 'position',
            type: 'integer',
            unsigned: true,
            isUnique: true
          },
          {
            name: 'status',
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

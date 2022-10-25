import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class PackagesTable1666608775203 implements MigrationInterface {
  tableName = 'packages';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'title',
            type: 'varchar'
          },
          {
            name: 'position',
            type: 'int',
            isUnique: true,
            isNullable: false
          },
          { name: 'image', type: 'varchar' },
          { name: 'seoDescription', type: 'text', isNullable: true },
          { name: 'link', type: 'varchar', isNullable: true },
          { name: 'status', type: 'boolean', default: true },
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

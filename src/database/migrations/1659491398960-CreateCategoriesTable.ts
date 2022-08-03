import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCategoriesTable1659491398960 implements MigrationInterface {
  tableName = 'categories';
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
            length: '255',
            isNullable: false
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'image',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'color',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'shortDescription',
            type: 'text',
            isNullable: true
          },
          {
            name: 'parentId',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'position',
            type: 'int',
            unsigned: true
          },
          {
            name: 'isNew',
            type: 'boolean',
            default: true
          },
          {
            name: 'isFeatured',
            type: 'boolean',
            default: false
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
        ],
        foreignKeys: [
          {
            columnNames: ['parentId'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ],
        indices: [
          {
            columnNames: ['slug']
          }
        ],
        uniques: [
          {
            columnNames: ['position', 'parentId']
          },
          {
            columnNames: ['slug', 'parentId']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}

import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMenusTable1659365526836 implements MigrationInterface {
  tableName = 'menus';
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
            type: 'varchar',
            length: '255'
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255'
          },
          {
            name: 'link',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'parentId',
            type: 'int',
            unsigned: true,
            isNullable: true
          },
          {
            name: 'menuType',
            type: 'enum',
            enum: ['direct', 'dropdown'],
            enumName: 'menuType',
            default: `'direct'`
          },
          {
            name: 'position',
            type: 'int',
            unsigned: true
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
            referencedTableName: 'menus',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ],
        indices: [
          {
            name: 'idx_slug',
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

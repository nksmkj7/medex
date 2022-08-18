import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ServiceTable1660747948495 implements MigrationInterface {
  tableName = 'services';

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
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'categoryId',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'subCategoryId',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: false
          },
          {
            name: 'durationInMinutes',
            unsigned: true,
            type: 'int',
            default: 0
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false
          },
          {
            name: 'price',
            type: 'decimal',
            default: 0,
            precision: 12,
            scale: 4
          },
          {
            name: 'discount',
            type: 'decimal',
            default: 0,
            precision: 5,
            scale: 2
          },
          {
            name: 'serviceCharge',
            type: 'decimal',
            default: 0,
            precision: 12,
            scale: 4
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
            name: 'ServiceParentCategory',
            columnNames: ['categoryId'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id']
          },
          {
            name: 'ServiceSubCategory',
            columnNames: ['subCategoryId'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id']
          },
          {
            name: 'ServiceProvider',
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id']
          }
        ],
        uniques: [
          {
            columnNames: ['slug', 'userId']
          }
        ],
        indices: [
          {
            name: 'IDX_' + this.tableName + '_slug',
            columnNames: ['slug']
          },
          {
            name: 'IDX_' + this.tableName + '_categoryId',
            columnNames: ['categoryId']
          },
          {
            name: 'IDX_' + this.tableName + '_subCategoryId',
            columnNames: ['subCategoryId']
          },
          {
            name: 'IDX_' + this.tableName + '_userId',
            columnNames: ['userId']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}

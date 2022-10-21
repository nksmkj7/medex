import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ProviderBannerTable1666257550023 implements MigrationInterface {
  tableName = 'provider_banners';
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
            name: 'userId',
            type: 'integer',
            isNullable: false
          },
          {
            name: 'image',
            type: 'varchar',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'link',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'isFeatured',
            type: 'boolean',
            default: true
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
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id']
          }
        ],
        indices: [
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

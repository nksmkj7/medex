import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createPlacesTable1679482886168 implements MigrationInterface {
  tableName = 'places';

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
            name: 'slug',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'countryId',
            type: 'int'
          },
          {
            name: 'cityId',
            type: 'int'
          },
          {
            name: 'name',
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
            columnNames: ['countryId'],
            referencedTableName: 'countries',
            referencedColumnNames: ['id']
          },
          {
            columnNames: ['cityId'],
            referencedTableName: 'cities',
            referencedColumnNames: ['id']
          }
        ],
        uniques: [
          {
            columnNames: ['countryId', 'slug', 'cityId']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}

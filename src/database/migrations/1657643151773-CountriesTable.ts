import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CountriesTable1657643151773 implements MigrationInterface {
  tableName = 'countries';

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
            name: 'name',
            type: 'varchar',
            length: '150',
            isNullable: false
          },
          {
            name: 'alphaCode',
            type: 'varchar',
            length: '10',
            isNullable: true
          },
          {
            name: 'alphaCode3',
            type: 'varchar',
            length: '10',
            isNullable: true
          },
          {
            name: 'alternateSpellings',
            type: 'varchar',
            isArray: true,
            isNullable: true
          },
          {
            name: 'callingCodes',
            type: 'varchar',
            isArray: true,
            isNullable: true
          },
          {
            name: 'currencies',
            type: 'varchar',
            isArray: true,
            isNullable: true
          },
          {
            name: 'languages',
            type: 'varchar',
            isArray: true,
            isNullable: true
          },
          {
            name: 'flag',
            type: 'varchar',
            isNullable: true
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

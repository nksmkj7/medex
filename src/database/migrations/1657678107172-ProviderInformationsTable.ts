import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ProviderInformationsTable1657678107172
  implements MigrationInterface
{
  tableName = 'provider_informations';
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
            name: 'userId',
            type: 'int'
          },
          {
            name: 'companyName',
            type: 'varchar',
            length: '150'
          },
          {
            name: 'phone1',
            type: 'varchar',
            length: '150'
          },
          {
            name: 'phone2',
            type: 'varchar',
            length: '150',
            isNullable: true
          },
          {
            name: 'startDate',
            type: 'date',
            isNullable: true
          },
          {
            name: 'countryId',
            type: 'int'
          },
          {
            name: 'city',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'state',
            type: 'varchar',
            length: '150',
            isNullable: true
          },
          {
            name: 'landmark',
            type: 'varchar',
            length: '150',
            isNullable: true
          },
          {
            name: 'timezone',
            type: 'varchar',
            length: '150',
            isNullable: true
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '150',
            isNullable: true
          },
          {
            name: 'contactPerson',
            type: 'varchar',
            length: '150',
            isNullable: true
          },
          {
            name: 'serviceArea',
            type: 'varchar',
            length: '150',
            isNullable: true
          },
          {
            name: 'businessLocaiton',
            type: 'varchar',
            length: '200',
            isNullable: true
          },
          {
            name: 'businessLogo',
            type: 'varchar',
            length: '150',
            isNullable: true
          },
          {
            name: 'businessDescription',
            type: 'text',
            isNullable: true
          },
          {
            name: 'vatNo',
            type: 'varchar',
            length: '150',
            isNullable: true
          },
          {
            name: 'termsCondition',
            type: 'text',
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
        ],
        foreignKeys: [
          {
            columnNames: ['countryId'],
            referencedTableName: 'countries',
            referencedColumnNames: ['id']
          },
          {
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}

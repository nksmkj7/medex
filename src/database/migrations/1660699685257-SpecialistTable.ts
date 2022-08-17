import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class SpecialistTable1660699685257 implements MigrationInterface {
  tableName = 'specialists';
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
            name: 'fullName',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'contactNo',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'primarySpeciality',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'educationTraining',
            type: 'text',
            isNullable: true
          },
          {
            name: 'experienceExpertise',
            type: 'text',
            isNullable: true
          },
          {
            name: 'publicAwards',
            type: 'text',
            isNullable: true
          },
          {
            name: 'membershipActivities',
            type: 'text',
            isNullable: true
          },
          {
            name: 'licenseRegistrationNumber',
            type: 'varchar',
            length: '255',
            isNullable: false,
            unsigned: true
          },
          {
            name: 'licenseCountry',
            type: 'int',
            unsigned: true,
            isNullable: false
          },
          {
            name: 'image',
            type: 'varchar',
            isNullable: false
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
            columnNames: ['licenseCountry'],
            referencedTableName: 'countries',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ],
        indices: [
          {
            columnNames: ['licenseRegistrationNumber']
          }
        ],
        uniques: [
          {
            columnNames: ['licenseRegistrationNumber', 'licenseCountry']
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}

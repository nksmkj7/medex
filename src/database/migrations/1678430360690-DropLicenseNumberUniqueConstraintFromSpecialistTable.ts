import { dropUniqueConstraints } from 'src/common/helper/general.helper';
import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableUnique
} from 'typeorm';

export class DropLicenseNumberUniqueConstraintFromSpecialistTable1678430360690
  implements MigrationInterface
{
  tableName = 'specialists';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await dropUniqueConstraints(queryRunner, this.tableName, [
      'licenseRegistrationNumber',
      'licenseCountry'
    ]);
    await queryRunner.changeColumns(this.tableName, [
      {
        oldColumn: new TableColumn({
          name: 'licenseRegistrationNumber',
          type: 'varchar',
          isNullable: false
        }),
        newColumn: new TableColumn({
          name: 'licenseRegistrationNumber',
          type: 'varchar',
          isNullable: true
        })
      },
      {
        oldColumn: new TableColumn({
          name: 'licenseCountry',
          type: 'int',
          isNullable: false
        }),
        newColumn: new TableColumn({
          name: 'licenseCountry',
          type: 'int',
          isNullable: true
        })
      }
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createUniqueConstraint(
      this.tableName,
      new TableUnique({
        columnNames: ['licenseRegistrationNumber', 'licenseCountry']
      })
    );
    await queryRunner.changeColumns(this.tableName, [
      {
        oldColumn: new TableColumn({
          name: 'licenseRegistrationNumber',
          type: 'varchar',
          isNullable: true
        }),
        newColumn: new TableColumn({
          name: 'licenseRegistrationNumber',
          type: 'varchar',
          isNullable: false
        })
      },
      {
        oldColumn: new TableColumn({
          name: 'licenseCountry',
          type: 'int',
          isNullable: true
        }),
        newColumn: new TableColumn({
          name: 'licenseCountry',
          type: 'int',
          isNullable: false
        })
      }
    ]);
  }
}

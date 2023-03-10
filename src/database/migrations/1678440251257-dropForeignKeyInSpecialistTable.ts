import { dropForeignKeys } from 'src/common/helper/general.helper';
import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class dropForeignKeyInSpecialistTable1678440251257
  implements MigrationInterface
{
  tableName = 'specialists';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await dropForeignKeys(queryRunner, this.tableName, ['licenseCountry']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      this.tableName,
      new TableForeignKey({
        columnNames: ['licenseCountry'],
        referencedTableName: 'countries',
        referencedColumnNames: ['id']
      })
    );
  }
}

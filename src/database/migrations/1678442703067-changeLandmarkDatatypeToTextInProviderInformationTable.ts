import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class changeLandmarkDatatypeToTextInProviderInformationTable1678442703067
  implements MigrationInterface
{
  tableName = 'provider_informations';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      this.tableName,
      new TableColumn({
        name: 'landmark',
        type: 'varchar',
        isNullable: true
      }),
      new TableColumn({
        name: 'landmark',
        type: 'text',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      this.tableName,
      new TableColumn({
        name: 'landmark',
        type: 'text',
        isNullable: true
      }),
      new TableColumn({
        name: 'landmark',
        type: 'varchar',
        isNullable: true
      })
    );
  }
}

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDayScheduleInformationColumnInProviderInformationTable1659625723144
  implements MigrationInterface
{
  tableName = 'provider_informations';
  public async up(queryRunner: QueryRunner): Promise<void> {
    const column1 = new TableColumn({
      name: 'daySchedules',
      type: 'jsonb',
      isNullable: true
    });

    const column2 = new TableColumn({
      name: 'is24Hr',
      type: 'boolean',
      isNullable: true
    });

    await queryRunner.addColumns(this.tableName, [column1, column2]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, ['is24hr', 'daySchedules']);
  }
}

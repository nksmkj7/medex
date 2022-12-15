import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MakeSpecialistIdNullableInSchedulesTablel1670947333869
  implements MigrationInterface
{
  tableName = 'schedules';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      this.tableName,
      new TableColumn({
        name: 'specialistId',
        type: 'varchar',
        isNullable: false
      }),
      new TableColumn({
        name: 'specialistId',
        type: 'varchar',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      this.tableName,

      new TableColumn({
        name: 'specialistId',
        type: 'varchar',
        isNullable: true
      }),
      new TableColumn({
        name: 'specialistId',
        type: 'varchar',
        isNullable: false
      })
    );
  }
}

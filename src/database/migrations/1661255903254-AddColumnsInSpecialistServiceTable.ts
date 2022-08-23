import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnsInSpecialistServiceTable1661255903254
  implements MigrationInterface
{
  tableName = 'service_specialist';
  columns = [
    new TableColumn({
      name: 'additionalTime',
      type: 'integer',
      default: 0,
      unsigned: true
    }),
    new TableColumn({
      name: 'startTime',
      type: 'time',
      isNullable: true
    }),
    new TableColumn({
      name: 'endTime',
      type: 'time',
      isNullable: true
    })
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}

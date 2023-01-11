import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScheduleTimeIdFieldInBookingTable1673421217392
  implements MigrationInterface
{
  tableName = 'bookings';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'scheduleTimeId',
        type: 'varchar',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, 'scheduleTimeId');
  }
}

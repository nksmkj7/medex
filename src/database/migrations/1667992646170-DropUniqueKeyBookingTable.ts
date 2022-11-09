import { MigrationInterface, QueryRunner, TableUnique } from 'typeorm';

export class DropUniqueKeyBookingTable1667992646170
  implements MigrationInterface
{
  tableName = 'bookings';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint(
      this.tableName,
      'UQ_a991b6a47c033f71108bf236c88'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createUniqueConstraint(
      this.tableName,
      new TableUnique({
        columnNames: ['scheduleId']
      })
    );
  }
}

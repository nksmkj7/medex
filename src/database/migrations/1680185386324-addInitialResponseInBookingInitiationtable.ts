import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addInitialResponseInBookingInitiationtable1680185386324
  implements MigrationInterface
{
  tableName = 'booking_initiation_logs';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'initialResponse',
        isNullable: true,
        type: 'jsonb'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, 'initialResponse');
  }
}

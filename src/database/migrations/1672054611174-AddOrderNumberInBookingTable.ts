import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOrderNumberInBookingTable1672054611174
  implements MigrationInterface
{
  column = new TableColumn({
    name: 'bookingNumber',
    type: 'integer',
    isGenerated: true,
    generationStrategy: 'increment'
  });

  tableName = 'bookings';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(this.tableName, this.column);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, this.column);
  }
}

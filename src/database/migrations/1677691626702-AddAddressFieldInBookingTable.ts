import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAddressFieldInBookingTable1677691626702
  implements MigrationInterface
{
  tableName = 'bookings';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'address',
        type: 'varchar',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, 'address');
  }
}

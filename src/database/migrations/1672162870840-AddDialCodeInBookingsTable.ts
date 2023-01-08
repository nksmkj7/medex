import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDialCodeInBookingsTable1672162870840
  implements MigrationInterface
{
  tableName = 'bookings';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'dialCode',
        isNullable: true,
        type: 'varchar'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      this.tableName,
      new TableColumn({
        name: 'dialCode',
        isNullable: true,
        type: 'varchar'
      })
    );
  }
}

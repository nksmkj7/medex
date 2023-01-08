import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class AddDialCodeInCustomerTable1672160974096
  implements MigrationInterface
{
  tableName = 'customers';
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

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPaymentMethodColumInTransactionTable1668924436756
  implements MigrationInterface
{
  tableName = 'transactions';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'paymentMethod',
        type: 'varchar',
        isNullable: true
      })
    );

    if (await queryRunner.hasColumn(this.tableName, 'paymentGateway')) {
      await queryRunner.dropColumn(this.tableName, 'paymentGateway');
    }

    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'paymentGateway',
        type: 'varchar',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, 'paymentMethod');
    await queryRunner.dropColumn(this.tableName, 'paymentGateway');
    // await queryRunner.changeColumn(
    //   this.tableName,
    //   new TableColumn({
    //     name: 'paymentGateway',
    //     type: 'varchar',
    //     isNullable: true
    //   }),
    //   new TableColumn({
    //     name: 'paymentGateway',
    //     type: 'enum'
    //   })
    // );
  }
}

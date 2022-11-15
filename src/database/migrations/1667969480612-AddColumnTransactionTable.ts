import { PaymentGatewayEnum } from 'src/booking/enums/payment-gateway.enum';
import { Column, MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnTransactionTable1667969480612
  implements MigrationInterface
{
  tableName = 'transactions';
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      new TableColumn({
        name: 'response_json',
        type: 'jsonb',
        isNullable: true
      }),
      new TableColumn({
        name: 'paymentGateway',
        type: 'enum',
        enum: ['2C2P', 'omise'],
        isNullable: true
      }),
      new TableColumn({
        name: 'currency',
        type: 'varchar',
        isNullable: true
      })
    ];
    await queryRunner.addColumns(this.tableName, columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, [
      'response_json',
      'paymentGateway',
      'currency'
    ]);
  }
}

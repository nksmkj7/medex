import { PaymentGatewayEnum } from 'src/booking/enums/payment-gateway.enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeEnumTransactionTable1668490134945
  implements MigrationInterface
{
  tableName = 'transactions';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      this.tableName,
      new TableColumn({
        name: 'paymentGateway',
        type: 'varchar',
        enum: [PaymentGatewayEnum['2C2P'], 'omise`'],
        isNullable: true
      }),
      new TableColumn({
        name: 'paymentGateway',
        type: 'enum',
        enum: [PaymentGatewayEnum['2C2P'], PaymentGatewayEnum.OMISE],
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      this.tableName,
      new TableColumn({
        name: 'paymentGateway',
        type: 'enum',
        enum: [PaymentGatewayEnum['2C2P'], PaymentGatewayEnum.OMISE],
        isNullable: true
      }),
      new TableColumn({
        name: 'paymentGateway',
        type: 'varchar',
        enum: [PaymentGatewayEnum['2C2P'], 'omise`'],
        isNullable: true
      })
    );
  }
}

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddServiceDiscountTypeInServiceTable1678875368578
  implements MigrationInterface
{
  tableName = 'services';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      this.tableName,
      new TableColumn({
        name: 'discount',
        type: 'decimal',
        default: 0,
        precision: 5,
        scale: 2
      }),
      new TableColumn({
        name: 'discount',
        type: 'decimal',
        default: 0,
        precision: 12,
        scale: 4
      })
    );
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'discountType',
        type: 'enum',
        enum: ['percent', 'amount'],
        enumName: 'discountType',
        default: `'percent'`
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      this.tableName,
      new TableColumn({
        name: 'discount',
        type: 'decimal',
        default: 0,
        precision: 12,
        scale: 4
      }),
      new TableColumn({
        name: 'discount',
        type: 'decimal',
        default: 0,
        precision: 5,
        scale: 2
      })
    );
    await queryRunner.dropColumn(this.tableName, 'discountType');
  }
}

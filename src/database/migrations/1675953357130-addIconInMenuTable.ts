import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addIconInMenuTable1675953357130 implements MigrationInterface {
  tableName = 'menus';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'icon',
        type: 'varchar',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, 'icon');
  }
}

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTagsColumnInServiceTable1674132367518
  implements MigrationInterface
{
  tableName = 'services';

  columns = [
    new TableColumn({
      name: 'tags',
      type: 'jsonb',
      isNullable: true
    }),
    new TableColumn({
      name: 'searchKeywords',
      type: 'varchar',
      isNullable: true
    }),
    new TableColumn({
      name: 'shortDescription',
      type: 'text',
      isNullable: true
    })
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}

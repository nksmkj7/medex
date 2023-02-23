import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddShowEamilLinkInProviderInformatiions41677174292495
  implements MigrationInterface
{
  tableName = 'provider_informations';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'showEmail',
        type: 'varchar',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, 'showEmail');
  }
}

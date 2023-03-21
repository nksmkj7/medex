import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addAdditionalInformationInServiceTable1679033311128
  implements MigrationInterface
{
  tableName = 'services';
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      !(await queryRunner.hasColumn(this.tableName, 'additionalInformation'))
    ) {
      await queryRunner.addColumn(
        this.tableName,
        new TableColumn({
          name: 'additionalInformation',
          type: 'jsonb',
          isNullable: true
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, 'additionalInformation');
  }
}

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addAdditionalInformationInServiceTable1679033311128
  implements MigrationInterface
{
  tableName = 'services';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'additionalInformation',
        type: 'jsonb',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.tableName, 'additionalInformation';
  }
}

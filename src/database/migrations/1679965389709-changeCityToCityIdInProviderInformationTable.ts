import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeCityToCityIdInProviderInformationTable1679965389709
  implements MigrationInterface
{
  tableName = 'provider_informations';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(this.tableName, 'city', 'cityId');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(this.tableName, 'cityId', 'city');
  }
}

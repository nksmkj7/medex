import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScheduleTypeFieldInServiceTable1671244055281
  implements MigrationInterface
{
  tableName = 'services';
  column = new TableColumn({
    name: 'scheduleType',
    type: 'enum',
    enum: ['both', 'service_only', 'specialist_only'],
    default: `'specialist_only'`
  });
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(this.tableName, this.column);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, this.column);
  }
}

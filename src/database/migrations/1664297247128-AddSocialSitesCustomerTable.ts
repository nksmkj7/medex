import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSocialSitesCustomerTable1664297247128
  implements MigrationInterface
{
  tableName = 'customers';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns(this.tableName, [
      {
        oldColumn: new TableColumn({
          name: 'firstName',
          type: 'varchar',
          isNullable: false
        }),
        newColumn: new TableColumn({
          name: 'firstName',
          type: 'varchar',
          isNullable: true
        })
      },
      {
        oldColumn: new TableColumn({
          name: 'lastName',
          type: 'varchar',
          isNullable: false
        }),
        newColumn: new TableColumn({
          name: 'lastName',
          type: 'varchar',
          isNullable: true
        })
      },
      {
        oldColumn: new TableColumn({
          name: 'phoneNumber',
          type: 'varchar',
          isNullable: false
        }),
        newColumn: new TableColumn({
          name: 'phoneNumber',
          type: 'varchar',
          isNullable: true
        })
      }
    ]);
    await queryRunner.addColumns(this.tableName, [
      new TableColumn({
        name: 'facebook',
        type: 'varchar',
        isNullable: true
      }),
      new TableColumn({
        name: 'twitter',
        type: 'varchar',
        isNullable: true
      }),
      new TableColumn({
        name: 'instagram',
        type: 'varchar',
        isNullable: true
      })
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns(this.tableName, [
      {
        newColumn: new TableColumn({
          name: 'firstName',
          type: 'varchar',
          isNullable: false
        }),
        oldColumn: new TableColumn({
          name: 'firstName',
          type: 'varchar',
          isNullable: true
        })
      },
      {
        newColumn: new TableColumn({
          name: 'lastName',
          type: 'varchar',
          isNullable: false
        }),
        oldColumn: new TableColumn({
          name: 'lastName',
          type: 'varchar',
          isNullable: true
        })
      },
      {
        newColumn: new TableColumn({
          name: 'phoneNumber',
          type: 'varchar',
          isNullable: false
        }),
        oldColumn: new TableColumn({
          name: 'phoneNumber',
          type: 'varchar',
          isNullable: true
        })
      }
    ]);

    await queryRunner.dropColumns(this.tableName, [
      'facebook',
      'twitter',
      'instagram'
    ]);
  }
}

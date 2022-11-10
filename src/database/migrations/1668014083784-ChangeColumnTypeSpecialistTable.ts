import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeColumnTypeSpecialistTable1668014083784
  implements MigrationInterface
{
  tableName = 'specialists';
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      {
        oldColumn: new TableColumn({
          name: 'primarySpecialty',
          type: 'varchar',
          isNullable: true
        }),
        newColumn: new TableColumn({
          name: 'primarySpecialty',
          type: 'text',
          isNullable: true
        })
      },
      {
        oldColumn: new TableColumn({
          name: 'educationTraining',
          type: 'varchar',
          isNullable: true
        }),
        newColumn: new TableColumn({
          name: 'educationTraining',
          type: 'text',
          isNullable: true
        })
      },
      {
        oldColumn: new TableColumn({
          name: 'experienceExpertise',
          type: 'varchar',
          isNullable: true
        }),
        newColumn: new TableColumn({
          name: 'experienceExpertise',
          type: 'text',
          isNullable: true
        })
      },
      {
        oldColumn: new TableColumn({
          name: 'publicAwards',
          type: 'varchar',
          isNullable: true
        }),
        newColumn: new TableColumn({
          name: 'publicAwards',
          type: 'text',
          isNullable: true
        })
      },
      {
        oldColumn: new TableColumn({
          name: 'membershipActivities',
          type: 'varchar',
          isNullable: true
        }),
        newColumn: new TableColumn({
          name: 'membershipActivities',
          type: 'text',
          isNullable: true
        })
      }
    ];
    await queryRunner.changeColumns(this.tableName, columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      {
        newColumn: new TableColumn({
          name: 'primarySpecialty',
          type: 'varchar',
          isNullable: true
        }),
        oldColumn: new TableColumn({
          name: 'primarySpecialty',
          type: 'text',
          isNullable: true
        })
      },
      {
        newColumn: new TableColumn({
          name: 'educationTraining',
          type: 'varchar',
          isNullable: true
        }),
        oldColumn: new TableColumn({
          name: 'educationTraining',
          type: 'text',
          isNullable: true
        })
      },
      {
        newColumn: new TableColumn({
          name: 'experienceExpertise',
          type: 'varchar',
          isNullable: true
        }),
        oldColumn: new TableColumn({
          name: 'experienceExpertise',
          type: 'text',
          isNullable: true
        })
      },
      {
        newColumn: new TableColumn({
          name: 'publicAwards',
          type: 'varchar',
          isNullable: true
        }),
        oldColumn: new TableColumn({
          name: 'publicAwards',
          type: 'text',
          isNullable: true
        })
      },
      {
        newColumn: new TableColumn({
          name: 'membershipActivities',
          type: 'varchar',
          isNullable: true
        }),
        oldColumn: new TableColumn({
          name: 'membershipActivities',
          type: 'text',
          isNullable: true
        })
      }
    ];
    await queryRunner.changeColumns(this.tableName, columns);
  }
}

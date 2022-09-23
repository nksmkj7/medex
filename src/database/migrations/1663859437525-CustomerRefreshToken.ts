import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey
} from 'typeorm';

export class CustomerRefreshToken1663859437525 implements MigrationInterface {
  foreignKeysArray = [
    {
      table: 'customers',
      field: 'customerId',
      reference: 'id'
    }
  ];
  tableName = 'customer_refresh_token';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },

          {
            name: 'ip',
            type: 'varchar',
            isNullable: true,
            length: '50'
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true
          },
          {
            name: 'isRevoked',
            type: 'boolean',
            default: false
          },
          {
            name: 'expires',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'browser',
            type: 'varchar',
            isNullable: true,
            length: '200'
          },
          {
            name: 'os',
            type: 'varchar',
            isNullable: true,
            length: '200'
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }),
      false
    );

    for (const foreignKey of this.foreignKeysArray) {
      await queryRunner.addColumn(
        this.tableName,
        new TableColumn({
          name: foreignKey.field,
          type: 'varchar'
        })
      );

      await queryRunner.createForeignKey(
        this.tableName,
        new TableForeignKey({
          columnNames: [foreignKey.field],
          referencedColumnNames: [foreignKey.reference],
          referencedTableName: foreignKey.table,
          onDelete: 'CASCADE'
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    for (const key of this.foreignKeysArray) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf(key.field) !== -1
      );
      await queryRunner.dropForeignKey(this.tableName, foreignKey);
      await queryRunner.dropColumn(this.tableName, key.field);
    }
    await queryRunner.dropTable(this.tableName);
  }
}

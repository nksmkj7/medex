import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CustomerTable1663656672749 implements MigrationInterface {
  tableName = 'customers';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'firstName',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'lastName',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'dob',
            type: 'date',
            isNullable: true
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'postCode',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'area',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'city',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'profilePicture',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'gender',
            type: 'enum',
            enum: ['male', 'female', 'other'],
            enumName: 'gender',
            isNullable: true
          },
          {
            name: 'token',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'tokenValidityDate',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'blocked'],
            enumName: 'status',
            default: `'inactive'`
          },
          {
            name: 'salt',
            type: 'varchar',
            isNullable: true
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
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}

import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateBackofficeLogTable1672125285625 implements MigrationInterface {
    tableName = 'back_office_logs'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table(
            {
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
                        name: 'bookingId',
                        type: 'varchar'
                    },
                    {
                        name: 'backOfficeResponse',
                        type: 'jsonb'
                    },
                    {
                        name: 'status',
                        type:'boolean'
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
                ],
                foreignKeys:[
                    {
                        name: 'Booking',
                        columnNames: ['bookingId'],
                        referencedTableName: 'bookings',
                        referencedColumnNames: ['id']
                    }
                ]
            }
        ))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(this.tableName)
    }

}

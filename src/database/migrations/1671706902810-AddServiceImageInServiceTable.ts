import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddServiceImageInServiceTable1671706902810 implements MigrationInterface {

    tableName = 'services'
    column = new TableColumn({
        name: 'image',
        type: 'varchar',
        isNullable:true
    })
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(this.tableName,this.column)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(this.tableName,this.column)
    }

}

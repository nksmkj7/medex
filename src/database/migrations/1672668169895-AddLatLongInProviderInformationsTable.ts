import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddLatLongInProviderInformationsTable1672668169895 implements MigrationInterface {
    
    tableName = 'provider_informations';

    columns = [
        new TableColumn({
            name: 'latitude',
            type: 'decimal'   ,
            isNullable:true,
            precision:10,
            scale:8
              
        }),
        new TableColumn({
            name: 'longitude',
            type: 'decimal',
            isNullable:true,
            precision:11,
            scale:8
        })
    ] 
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns(this.tableName,this.columns)
     }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns(this.tableName,this.columns)
    }

}

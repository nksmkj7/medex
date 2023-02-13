import {
  MigrationInterface,
  QueryRunner,
  TableCheck,
  TableColumn
} from 'typeorm';

export class addNoOfPeopleInBookingTable1675870447176
  implements MigrationInterface
{
  tableName = 'bookings';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'numberOfPeople',
        type: 'integer',
        default: 1,
        unsigned: true
      })
    );

    await queryRunner.createCheckConstraint(
      this.tableName,
      new TableCheck({
        expression: `"numberOfPeople" > 0`,
        name: 'positive_booking_people_number'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, 'numberOfPeople');
    await queryRunner.dropCheckConstraint(
      this.tableName,
      'positive_booking_people_number'
    );
  }
}

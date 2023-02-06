import { BookingStatusEnum } from 'src/booking/enums/booking-status.enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBookingStatusEnumInBookingTable1675650523856
  implements MigrationInterface
{
  tableName = 'bookings';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(this.tableName, 'status', 'oldStatus');
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: [
          BookingStatusEnum.CONFIRMED,
          BookingStatusEnum.PROCESSING,
          BookingStatusEnum.DELIVERED,
          BookingStatusEnum.PENDING,
          BookingStatusEnum.REFUNDED
        ],
        default: `'${BookingStatusEnum.PENDING}'`
      })
    );
    await queryRunner.query(
      'update bookings set status = bookings."oldStatus"::text::bookings_status_enum'
    );
    await queryRunner.dropColumn(this.tableName, 'oldStatus');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(this.tableName, 'status', 'oldStatus');
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: [
          BookingStatusEnum.CONFIRMED,
          BookingStatusEnum.PROCESSING,
          BookingStatusEnum.DELIVERED,
          BookingStatusEnum.PENDING,
          BookingStatusEnum.REFUNDED
        ],
        default: `'${BookingStatusEnum.PENDING}'`
      })
    );
    await queryRunner.query(
      'update bookings set status = bookings."oldStatus"::text::bookings_status_enum'
    );
    await queryRunner.dropColumn(this.tableName, 'oldStatus');
  }
}

import ErrorHandler from '../utils/errors/errorHandler';

export class BookingDateGenerator {
  /**
   * Format a date as 'YYYY-MM-DD'
   * @param date The date to format
   * @returns Formatted date string
   */
  private static formatYYYYMMDD(date: Date): string {
    return date.toISOString().split('T')[0]; // returns 'YYYY-MM-DD'
  }

  /**
   * Get today's date as 'YYYY-MM-DD'
   * @returns Today's date as string
   */
  static getToday(): string {
    return this.formatYYYYMMDD(new Date());
  }

  static createBookingDatesfromCurrentDate(checkoutDaysFromCheckin: number = 1): {
    checkin: string;
    checkout: string;
  } {
    const today = new Date();
    const checkinDate = new Date(today.getTime());
    const checkoutDate = new Date(
      checkinDate.getTime() + checkoutDaysFromCheckin * 24 * 60 * 60 * 1000,
    );

    return {
      checkin: this.formatYYYYMMDD(checkinDate),
      checkout: this.formatYYYYMMDD(checkoutDate),
    };
  }

  /**
   * Create a booking dates object with checkin and checkout dates
   * @param checkinDaysFromNow Days from now for checkin (can be negative for past dates)
   * @param checkoutDaysFromCheckin Days from checkin for checkout
   * @returns Booking dates object with checkin and checkout fields
   */
  static createBookingDates(
    checkinDaysFromNow: number = 0,
    checkoutDaysFromCheckin: number = 1,
  ): { checkin: string; checkout: string } {
    const today = new Date();
    const checkinDate = new Date(today.getTime() + checkinDaysFromNow * 24 * 60 * 60 * 1000);
    const checkoutDate = new Date(
      checkinDate.getTime() + checkoutDaysFromCheckin * 24 * 60 * 60 * 1000,
    );

    return {
      checkin: this.formatYYYYMMDD(checkinDate),
      checkout: this.formatYYYYMMDD(checkoutDate),
    };
  }

  /**
   * Create a booking dates object with specific dates
   * @param checkinDate Specific checkin date
   * @param checkoutDate Specific checkout date
   * @returns Booking dates object with checkin and checkout fields
   */
  static createSpecificBookingDates(
    checkinDate: Date,
    checkoutDate: Date,
  ): { checkin: string; checkout: string } {
    if (checkoutDate < checkinDate) {
      ErrorHandler.logAndThrow(
        'Checkout date must be after checkin date',
        'createSpecificBookingDates',
      );
    }

    return {
      checkin: this.formatYYYYMMDD(checkinDate),
      checkout: this.formatYYYYMMDD(checkoutDate),
    };
  }
}

import { test } from '../../fixtures/restfulBooker.fixture';
import { TEST_CONSTANTS } from '../../src/utils/dataStore/testIds/index';
import { BookingTokenMap } from '../../src/utils/dataStore/maps/bookingMaps';
import TestDataStoreManager from '../../src/utils/dataStore/utils/testDataStoreManager';
import ErrorHandler from '../../src/utils/errors/errorHandler';
import logger from '../../src/utils/logging/loggerManager';

test.describe('All Booking Test Suite @regression', () => {
  test('should get all booking @sanity', async ({ booking }) => {
    await booking.getAllBookings();

    logger.info('Get all bookings completed successfully.');
  });

  test('should create new booking @sanity', async ({ booking }) => {
    await booking.createNewBooking();

    logger.info('Create new booking completed successfully.');
  });
});

test.describe('Create Booking Test Suite @regression', () => {
  test('should create new booking @sanity', async ({ booking }) => {
    await booking.createNewBooking();

    logger.info('Create new booking completed successfully.');
  });

  test('should accept concurrent new booking @sanity', async ({ booking }) => {
    const concurrentRuns = 50;
    const bookingIds: string[] = [];

    // Create an array to collect all promises and their results
    const createBookingRequests = Array.from({ length: concurrentRuns }, async (_, index) => {
      const result = await booking.createConcurrentNewBooking(`concurrent_booking_${index}`);
      bookingIds.push(result);
      return result;
    });

    await Promise.all(createBookingRequests);

    // Store all booking IDs in a test data collection
    TestDataStoreManager.setValue(
      BookingTokenMap.booking,
      TEST_CONSTANTS.TEST_IDS.bookingTestIds.CONCURRENT_BOOKINGS,
      'bookingIds',
      bookingIds.join(','),
    );

    logger.info(
      `Concurrent new booking requests completed successfully. Created ${bookingIds.length} bookings.`,
    );
  });
});

test.describe('Get Booking Test Suite @regression', () => {
  test('should get booking by id @sanity', async ({ booking }) => {
    // Create a new booking
    await booking.createNewBooking();

    // Get the booking ID
    const bookingId = TestDataStoreManager.getValue(
      BookingTokenMap.booking,
      TEST_CONSTANTS.TEST_IDS.bookingTestIds.CREATE_NEW_BOOKING_AND_STORE_BOOKING_ID,
      'bookingId',
    );

    // Get the booking
    if (typeof bookingId === 'number') {
      await booking.getBookingById(bookingId);
      logger.info('Get booking by id completed successfully.');
    } else {
      ErrorHandler.logAndThrow('Invalid booking ID: must be a number', 'getBookingById');
    }
  });
});

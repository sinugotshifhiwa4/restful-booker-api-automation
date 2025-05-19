import { test } from '../../fixtures/restfulBooker.fixture';

import { BookingMap } from '../../src/utils/dataStore/maps/bookingMaps';
import TestDataStore from '../../src/utils/dataStore/utils/testDataStore';
import { StorableObject } from '../../src/models/api/testDataStore.types';
import { BookingResponse } from '../../src/models/api/booking.interface';
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

test.describe('Get Booking Test Suite @regression', () => {
  test('should get booking by id @sanity', async ({ booking, testId }) => {
    // Create a new booking
    const response = await booking.createNewBooking();

    TestDataStore.setValue(
      BookingMap.booking,
      testId.TEST_IDS.bookingTestIds.STORE_BOOOKING_ID,
      'responseObject',
      response.data as StorableObject,
    );

    const data = TestDataStore.getValue(
      BookingMap.booking,
      testId.TEST_IDS.bookingTestIds.STORE_BOOOKING_ID,
      'responseObject',
    ) as unknown as BookingResponse;

    // Get the booking
    const bookingId = data.bookingid;

    if (typeof bookingId === 'number') {
      await booking.getBookingById(bookingId);
      logger.info('Get booking by id completed successfully.');
    } else {
      ErrorHandler.logAndThrow('Invalid booking ID: must be a number', 'getBookingById');
    }
  });
});

import { test } from '../../fixtures/restfulBooker.fixture';

import { BookingMap } from '../../src/utils/dataStore/maps/bookingMaps';
import TestDataStore from '../../src/utils/dataStore/utils/testDataStore';
import { StorableObject } from '../../src/models/api/testDataStore.types';
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
    // === BOOKING CREATION: Create and store new booking ===
    const response = await booking.createNewBooking();

    TestDataStore.setValue(
      BookingMap.booking,
      testId.TEST_IDS.bookingTestIds.STORE_BOOOKING_ID,
      'responseObject',
      response.data as StorableObject,
    );

    // === GET BOOKING: Get booking using stored bookingId ===
    const bookingId = response.data.bookingid;

    if (typeof bookingId === 'number') {
      await booking.getBookingById(bookingId);
      logger.info('Get booking by id completed successfully.');
    } else {
      ErrorHandler.logAndThrow('Invalid booking ID: must be a number', 'getBookingById');
    }
  });

  test.only('should update booking by id @sanity', async ({
    authenticationToken,
    booking,
    testId,
  }) => {
    // === AUTHENTICATION: Request and store token ===
    const tokenResponse = await authenticationToken.requestTokenWithValidCredentials();
    const token = await authenticationToken.getTokenFromResponse(tokenResponse);

    // === BOOKING CREATION: Create and store new booking ===
    const newBookingResponse = await booking.createNewBooking();

    TestDataStore.setValue(
      BookingMap.booking,
      testId.TEST_IDS.bookingTestIds.STORE_BOOOKING_ID,
      'responseObject',
      newBookingResponse.data as StorableObject,
    );

    const bookingId = newBookingResponse.data.bookingid;

    // === BOOKING UPDATE: Update booking using stored token and bookingId ===
    if (typeof bookingId === 'number') {
      await booking.updateBookingById(bookingId, token);

      logger.info('Update booking by id completed successfully.');
    } else {
      ErrorHandler.logAndThrow('Invalid booking ID: must be a number', 'updateBookingById');
    }
  });
});

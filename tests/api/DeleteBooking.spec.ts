import { test } from '../../fixtures/restfulBooker.fixture';

import { BookingMap } from '../../src/utils/dataStore/maps/bookingMaps';
import TestDataStore from '../../src/utils/dataStore/utils/testDataStore';
import { StorableObject } from '../../src/models/api/testDataStore.types';
import ErrorHandler from '../../src/utils/errors/errorHandler';
import logger from '../../src/utils/logging/loggerManager';

test.describe('Delete Booking Test Suite @regression', () => {
  test('should delete booking by id @sanity', async ({
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
      testId.TEST_IDS.bookingTestIds.DELETE_BOOKING_DATA,
      'responseObject',
      newBookingResponse.data as StorableObject,
    );

    const bookingId = newBookingResponse.data.bookingid;

    // === DELETE BOOKING: Delete booking using stored token and bookingId ===
    if (typeof bookingId === 'number') {
      await booking.deleteBookingById(bookingId, token);

      // attempt to get deleted booking
      await booking.getBookingByIdNotFound(bookingId);

      logger.info('Delete booking by id completed successfully.');
    } else {
      ErrorHandler.logAndThrow('Invalid booking ID: must be a number', 'deleteBookingById');
    }
  });
});

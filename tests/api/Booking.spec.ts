import { test } from '../../fixtures/restfulBooker.fixture';
import logger from '../../src/utils/logging/loggerManager';

test.describe('Booking Test Suite @regression', () => {
  test('should get all booking @sanity', async ({ booking }) => {
    await booking.getAllBookings();

    logger.info('Get all bookings completed successfully.');
  });
});

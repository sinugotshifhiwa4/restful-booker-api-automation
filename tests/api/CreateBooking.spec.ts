import { test } from '../../fixtures/restfulBooker.fixture';
import logger from '../../src/utils/logging/loggerManager';

test.describe('Create Booking Test Suite @regression', () => {
  test('should create new booking @sanity', async ({ booking }) => {
    await booking.createNewBooking();
    logger.info('Create new booking completed successfully.');
  });
});

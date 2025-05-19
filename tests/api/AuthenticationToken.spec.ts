import { test } from '../../fixtures/restfulBooker.fixture';
import { BookingMap } from '../../src/utils/dataStore/maps/bookingMaps';
import TestDataStore from '../../src/utils/dataStore/utils/testDataStore';
import logger from '../../src/utils/logging/loggerManager';

test.describe('Authentication Token Tests @regression', () => {
  test('should reject invalid credentials', async ({ authenticationToken }) => {
    await authenticationToken.requestTokenWithInvalidCredentials();

    logger.info('Authentication token request with invalid credentials completed successfully.');
  });

  test('should accept valid credentials @sanity', async ({ authenticationToken, testId }) => {
    const response = await authenticationToken.requestTokenWithValidCredentials();

    // Extract the token from the response
    const token = await authenticationToken.getTokenFromResponse(response);

    // Store the token in the test data store
    TestDataStore.setValue(
      BookingMap.token,
      testId.TEST_IDS.tokenTestIds.REQUEST_TOKEN_WITH_VALID_CREDENTIALS,
      'token',
      token,
    );

    logger.info('Authentication token request with valid credentials completed successfully.');
  });
});

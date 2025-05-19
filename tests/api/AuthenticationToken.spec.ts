import { test } from '../../fixtures/restfulBooker.fixture';
import logger from '../../src/utils/logging/loggerManager';

test.describe('Authentication Token Tests @regression', () => {
  test('should reject invalid credentials', async ({ authenticationToken }) => {
    await authenticationToken.requestTokenWithInvalidCredentials();

    logger.info('Authentication token request with invalid credentials completed successfully.');
  });

  test('should accept valid credentials @sanity', async ({ authenticationToken }) => {
    await authenticationToken.requestTokenWithValidCredentials();
    logger.info('Authentication token request with valid credentials completed successfully.');
  });
});

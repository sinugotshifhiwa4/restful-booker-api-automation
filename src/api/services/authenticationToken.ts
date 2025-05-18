import { AxiosResponse } from 'axios';
import { BookingEndpointBuilder } from '../endpoints/bookingEndpointBuilder';
import { EnvironmentResolver } from '../../config/environment/resolver/environmentResolver';
import { ApiClient } from '../client/apiClient';
import RequestContext from '../context/requestContext';
import ApiResponseValidator from '../validators/apiResponseValidator';
import * as tokenCredentials from '../../testData/tokenCredentials.json';
import BookingValidations from '../validators/bookingValidations';
import { TEST_CONSTANTS } from '../../utils/dataStore/testIds/index';
import { BookingTokenMap } from '../../utils/dataStore/maps/bookingMaps';
import ApiErrorResponseBuilder from '../../utils/errors/apiErrorResponseBuilder';
import ErrorHandler from '../../utils/errors/errorHandler';
import TestDataStoreManager from '../../utils/dataStore/utils/testDataStoreManager';

export class AuthenticationToken {
  private apiClient: ApiClient;
  private bookingEndpointBuilder: BookingEndpointBuilder;
  private environmentResolver: EnvironmentResolver;

  constructor(
    apiClient: ApiClient,
    bookingEndpointBuilder: BookingEndpointBuilder,
    environmentResolver: EnvironmentResolver,
  ) {
    this.apiClient = apiClient;
    this.bookingEndpointBuilder = bookingEndpointBuilder;
    this.environmentResolver = environmentResolver;
  }
  public async requestTokenWithInvalidCredentials(): Promise<void> {
    try {
      /* 
  Register negative test expectation.
  Note: This is a demo website (Restful Booker) that returns HTTP 200 even for failed authentication attempts.
  Although 200 typically implies success, we must validate the response content to confirm it's an actual failure.
  This behavior is incorrect by REST standards, but it's outside our control in this demo environment.
*/
      RequestContext.registerExpectation('requestTokenWithInvalidCredentials', [200], true);

      // Resolve the username from the active environment configuration
      const { username } = await this.environmentResolver.getTokenCredentials();

      // Create a fresh copy of the base credentials template to avoid mutating shared test data.
      // Override the username and password with valid credentials from the current environment.
      const userCredentials = { ...tokenCredentials.Credentials };

      userCredentials.username = username;
      userCredentials.password = 'invalid_password';

      // Send authentication request with invalid credentials
      const response = await this.apiClient.sendPostRequest(
        await this.bookingEndpointBuilder.tokenEndpoint(),
        userCredentials,
        undefined,
      );

      BookingValidations.validateInvalidTokenResponse(response);

      // Validate the API response to confirm expected failure
      ApiResponseValidator.validateNegativeTestResponse(
        response,
        200,
        'requestTokenWithInvalidCredentials',
      );
    } catch (error) {
      ApiErrorResponseBuilder.handleNegativeTestError(error, 'requestTokenWithInvalidCredentials');
    }
  }

  public async requestTokenWithValidCredentials(): Promise<void> {
    try {
      // Register positive test expectation
      RequestContext.registerExpectation('requestTokenWithValidCredentials', [200], true);

      // Resolve the username from the active environment configuration
      const { username, password } = await this.environmentResolver.getTokenCredentials();

      // Create a fresh copy of the base credentials template to avoid mutating shared test data.
      // Override the username and password with valid credentials from the current environment.
      const userCredentials = { ...tokenCredentials.Credentials };

      userCredentials.username = username;
      userCredentials.password = password;

      // Send authentication request with valid credentials
      const response = await this.apiClient.sendPostRequest(
        await this.bookingEndpointBuilder.tokenEndpoint(),
        userCredentials,
        undefined,
      );

      // Validate response structure and content
      BookingValidations.validateValidTokenResponse(response);

      // Validate response matches expected status code
      ApiResponseValidator.validatePositiveTestResponse(
        response,
        200,
        'requestTokenWithValidCredentials',
      );

      // Extract the token from the response
      const token = await this.getTokenFromResponse(response);

      // Store the token in the test data store
      TestDataStoreManager.setValue(
        BookingTokenMap.token,
        TEST_CONSTANTS.TEST_IDS.tokenTestIds.REQUEST_TOKEN_WITH_VALID_CREDENTIALS,
        'token',
        token,
      );
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'requestTokenWithValidCredentials',
        'Failed to request token with valid credentials',
      );
      throw error;
    }
  }

  private async getTokenFromResponse(response: AxiosResponse): Promise<string> {
    try {
      const data = response?.data;

      if (!data || typeof data !== 'object') {
        ErrorHandler.logAndThrow('Invalid response format', 'getTokenFromResponse');
      }

      const token = data.token;
      if (typeof token !== 'string') {
        ErrorHandler.logAndThrow('Token not found or invalid in response', 'getTokenFromResponse');
      }

      return token;
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'getTokenFromResponse',
        'Failed to get token from response',
      );
      throw error;
    }
  }
}

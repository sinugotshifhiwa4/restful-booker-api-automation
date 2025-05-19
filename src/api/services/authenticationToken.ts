import { AxiosResponse } from 'axios';
import { BookingEndpointBuilder } from '../endpoints/bookingEndpointBuilder';
import { EnvironmentResolver } from '../../config/environment/resolver/environmentResolver';
import { ApiClient } from '../client/apiClient';
import RequestContext from '../context/requestContext';
import ApiResponseValidator from '../validators/apiResponseValidator';
import * as tokenCredentials from '../../testData/tokenCredentials.json';
import BookingValidations from '../validators/bookingValidations';
import ApiErrorResponseBuilder from '../../utils/errors/apiErrorResponseBuilder';
import ErrorHandler from '../../utils/errors/errorHandler';

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
      // Register negative test expectation.
      // Note: This is a demo website (Restful Booker) that returns HTTP 200 even for failed authentication attempts.
      // Although 200 typically implies success, we must validate the response content to confirm it's an actual failure.
      // This behavior is incorrect by REST standards, but it's outside our control in this demo environment.

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

  public async requestTokenWithValidCredentials(): Promise<AxiosResponse> {
    try {
      // Register positive test expectation
      RequestContext.registerExpectation('requestTokenWithValidCredentials', [200], false);

      // Resolve the username from the active environment configuration
      const { username, password } = await this.environmentResolver.getTokenCredentials();

      const userCredentials = await this.createTokenPayload(username, password);

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

      return response;
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'requestTokenWithValidCredentials',
        'Failed to request token with valid credentials',
      );
      throw error;
    }
  }

  private async createTokenPayload(username: string, password: string) {
    try {
      // Create a fresh copy of the base credentials template to avoid mutating shared test data.
      // Override the username and password with valid credentials from the current environment.
      const userCredentials = { ...tokenCredentials.Credentials };

      userCredentials.username = username;
      userCredentials.password = password;

      return userCredentials;
    } catch (error) {
      ErrorHandler.captureError(error, 'createTokenPayload', 'Failed to create token payload');
      throw error;
    }
  }

  /**
   * Extracts token from response
   * @param response The Axios response object
   * @returns The token string
   */
  public async getTokenFromResponse(response: AxiosResponse): Promise<string> {
    return BookingValidations.extractPropertyFromResponse<string>(
      response,
      'token',
      'getTokenFromResponse',
    );
  }
}

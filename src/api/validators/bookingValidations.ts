import { expect } from 'playwright/test';
import { AxiosResponse } from 'axios';
import { InvalidTokenResponse, ValidTokenResponse } from '../../models/api/booking.interface';
import ErrorHandler from '../../utils/errors/errorHandler';
import logger from '../../utils/logging/loggerManager';

export default class BookingValidations {
  public static validateInvalidTokenResponse(response: AxiosResponse): void {
    try {
      if (!response || !response.data) {
        ErrorHandler.logAndThrow(
          'Response or response data is null',
          'validateInvalidTokenResponse',
        );
      }

      const responseData = response.data as InvalidTokenResponse;
      expect(responseData.reason).toBe('Bad credentials');

      logger.info('Successfully validated invalid token response');
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'validateInvalidTokenResponse',
        'Failed to validate invalid token response',
      );
      throw error;
    }
  }

  public static validateValidTokenResponse(response: AxiosResponse): void {
    try {
      if (!response || !response.data) {
        ErrorHandler.logAndThrow('Response or response data is null', 'validateValidTokenResponse');
      }

      const responseData = response.data as ValidTokenResponse;
      expect(responseData.token).toBeDefined();

      logger.info('Successfully validated valid token response');
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'validateValidTokenResponse',
        'Failed to validate valid token response',
      );
      throw error;
    }
  }
}

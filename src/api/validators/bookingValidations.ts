import { expect } from 'playwright/test';
import { AxiosResponse } from 'axios';
import { InvalidTokenResponse, ValidTokenResponse } from '../../models/api/booking.interface';
import ErrorHandler from '../../utils/errors/errorHandler';
import logger from '../../utils/logging/loggerManager';

export default class BookingValidations {
  /**
   * Validates the response from a failed token request due to invalid credentials.
   * Ensures the response contains the expected error structure and reason.
   *
   * @param response - The Axios response object from the token request
   */
  public static validateInvalidTokenResponse(response: AxiosResponse): void {
    try {
      const data = response?.data;

      if (!data || typeof data !== 'object') {
        ErrorHandler.logAndThrow('Invalid response format', 'validateInvalidTokenResponse');
      }

      const responseData = response.data as InvalidTokenResponse;

      expect(responseData.reason, 'Expected "reason" field to be "Bad credentials"').toBe(
        'Bad credentials',
      );
      expect(typeof responseData.reason).toBe('string');
      expect(responseData.reason.toLowerCase()).toContain('bad');

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

  /**
   * Validates the response from a successful token request with valid credentials.
   * Ensures the response contains a valid token.
   *
   * @param response - The Axios response object from the token request
   */
  public static validateValidTokenResponse(response: AxiosResponse): void {
    try {
      const data = response?.data;

      if (!data || typeof data !== 'object') {
        ErrorHandler.logAndThrow('Invalid response format', 'validateValidTokenResponse');
      }

      const responseData = response.data as ValidTokenResponse;

      expect(responseData.token, 'Expected a token to be present in the response').toBeDefined();
      expect(typeof responseData.token).toBe('string');
      expect(responseData.token.length).toBeGreaterThan(0);

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

  /**
 * Validates the response from getting all bookings.
 * Ensures the response is an array where each item has a bookingid with a numeric value.
 *
 * @param response - The Axios response object from the getAllBookings request
 */
public static validateGetAllBookingsResponse(response: AxiosResponse): void {
  try {
    const data = response?.data;

    if (!Array.isArray(data)) {
      ErrorHandler.logAndThrow('Invalid response format, expected an array', 'validateGetAllBookingsResponse');
    }

    data.forEach((booking, index) => {
      if (!booking || typeof booking !== 'object') {
        ErrorHandler.logAndThrow(`Item at index ${index} is not a valid object`, 'validateGetAllBookingsResponse');
      }

      expect(booking.bookingid, `Booking at index ${index} should have a bookingid`).toBeDefined();
      expect(typeof booking.bookingid, `Booking ID at index ${index} should be a number`).toBe('number');
      expect(Number.isInteger(booking.bookingid), `Booking ID at index ${index} should be an integer`).toBe(true);
    });

    logger.info(`Successfully validated getAllBookings response with ${data.length} bookings`);
  } catch (error) {
    ErrorHandler.captureError(
      error,
      'validateGetAllBookingsResponse',
      'Failed to validate getAllBookings response',
    );
    throw error;
  }
}

}

import { expect } from 'playwright/test';
import { AxiosResponse } from 'axios';
import TestDataStore from '../../utils/dataStore/utils/testDataStore';
import { BookingMap } from '../../utils/dataStore/maps/bookingMaps';
import { TEST_CONSTANTS } from '../../utils/dataStore/testIds/index';
import {
  InvalidTokenResponse,
  ValidTokenResponse,
  BookingResponse,
  Booking,
  BookingDates,
} from '../../models/api/booking.interface';
import { BookingDateGenerator } from '../../testData/bookingDateGenerator';
import * as bd from '../../testData/bookingData.json';
import ErrorHandler from '../../utils/errors/errorHandler';
import logger from '../../utils/logging/loggerManager';
import ApiErrorResponseBuilder from '../../utils/errors/apiErrorResponseBuilder';

export default class BookingValidations {
  /**
   * Helper method to validate basic response structure
   *
   * @param response - The Axios response object
   * @param methodName - The name of the calling method for error context
   * @param expectedType - The expected type of the response (default: 'object')
   * @returns The validated response data
   */
  public static validateResponseData<T>(
    response: AxiosResponse,
    methodName: string,
    expectedType: 'object' | 'array' = 'object',
  ): T {
    const data = response?.data;

    if (!data) {
      ErrorHandler.logAndThrow('Invalid response format: missing data', methodName);
    }

    if (expectedType === 'array' && !Array.isArray(data)) {
      ErrorHandler.logAndThrow('Invalid response format, expected an array', methodName);
    } else if (expectedType === 'object' && (typeof data !== 'object' || Array.isArray(data))) {
      ErrorHandler.logAndThrow('Invalid response format, expected an object', methodName);
    }

    return data as T;
  }

  /**
   * Helper method to extract a property from an API response
   * @param response The Axios response object
   * @param propertyName The name of the property to extract
   * @param methodName The calling method name for error logging
   * @returns The extracted property value
   */
  public static async extractPropertyFromResponse<T>(
    response: AxiosResponse,
    propertyName: string,
    methodName: string,
  ): Promise<T> {
    try {
      const data = response?.data;

      if (!data || typeof data !== 'object') {
        ErrorHandler.logAndThrow(`Invalid response format`, methodName);
      }

      const propertyValue = data[propertyName];

      if (propertyValue === undefined || propertyValue === null) {
        ErrorHandler.logAndThrow(`${propertyName} not found in response`, methodName);
      }

      return propertyValue as T;
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        methodName,
        `Failed to get ${propertyName} from response`,
      );
      throw error;
    }
  }

  /**
   * Validates the response from a failed token request due to invalid credentials.
   * Ensures the response contains the expected error structure and reason.
   *
   * @param response - The Axios response object from the token request
   */
  public static validateInvalidTokenResponse(response: AxiosResponse): void {
    try {
      const methodName = 'validateInvalidTokenResponse';
      const responseData = this.validateResponseData<InvalidTokenResponse>(response, methodName);

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
      const methodName = 'validateValidTokenResponse';
      const responseData = this.validateResponseData<ValidTokenResponse>(response, methodName);

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
      const methodName = 'validateGetAllBookingsResponse';
      const data = this.validateResponseData<Array<{ bookingid: number }>>(
        response,
        methodName,
        'array',
      );

      data.forEach((booking, index) => {
        if (!booking || typeof booking !== 'object') {
          ErrorHandler.logAndThrow(`Item at index ${index} is not a valid object`, methodName);
        }

        expect(
          booking.bookingid,
          `Booking at index ${index} should have a bookingid`,
        ).toBeDefined();
        expect(typeof booking.bookingid, `Booking ID at index ${index} should be a number`).toBe(
          'number',
        );
        expect(
          Number.isInteger(booking.bookingid),
          `Booking ID at index ${index} should be an integer`,
        ).toBe(true);
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

  public static validateNewlyCreatedBooking(response: AxiosResponse): void {
    try {
      const methodName = 'validateNewlyCreatedBooking';
      const data = this.validateResponseData<BookingResponse>(response, methodName);

      this.validateBookingId(data.bookingid);
      this.validateBooking(data.booking);
      logger.info(`Successfully validated newly created booking with ID: ${data.bookingid}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'validateNewlyCreatedBooking',
        'Failed to validate newly created booking',
      );
      throw error;
    }
  }

  private static validateBookingId(bookingid: number): void {
    expect(bookingid, 'bookingid should be defined').toBeDefined();
    expect(typeof bookingid, 'bookingid should be a number').toBe('number');
    expect(Number.isInteger(bookingid), 'bookingid should be an integer').toBe(true);
  }

  private static validateBooking(booking: Booking): void {
    expect(booking, 'booking should be defined').toBeDefined();
    expect(typeof booking, 'booking should be an object').toBe('object');
    expect(booking, 'booking should not be empty').not.toEqual({});

    expect(typeof booking.firstname, 'firstname should be a string').toBe('string');
    expect(booking.firstname.length, 'firstname should not be empty').toBeGreaterThan(0);

    expect(typeof booking.lastname, 'lastname should be a string').toBe('string');
    expect(booking.lastname.length, 'lastname should not be empty').toBeGreaterThan(0);

    expect(typeof booking.totalprice, 'totalprice should be a number').toBe('number');
    expect(booking.totalprice).toBeGreaterThan(0);

    expect(typeof booking.depositpaid, 'depositpaid should be a boolean').toBe('boolean');

    this.validateBookingDates(booking.bookingdates);

    if (booking.additionalneeds !== undefined) {
      this.validateAdditionalNeeds(booking.additionalneeds);
    }
  }

  private static validateBookingDates(bookingdates: BookingDates): void {
    expect(bookingdates, 'bookingdates should be defined').toBeDefined();
    expect(typeof bookingdates, 'bookingdates should be an object').toBe('object');
    expect(bookingdates, 'bookingdates should not be empty').not.toEqual({});

    expect(typeof bookingdates.checkin, 'checkin should be a string').toBe('string');
    expect(new Date(bookingdates.checkin).toString()).not.toBe('Invalid Date');

    expect(typeof bookingdates.checkout, 'checkout should be a string').toBe('string');
    expect(new Date(bookingdates.checkout).toString()).not.toBe('Invalid Date');
  }

  private static validateAdditionalNeeds(additionalneeds: unknown): void {
    expect(typeof additionalneeds, 'additionalneeds should be a string').toBe('string');
  }

  /**
   * Validates the response from getting a booking by ID.
   * Ensures the response contains valid booking details.
   *
   * @param response - The Axios response object from the getBookingById request
   */
  public static validateGetBookingByIdResponse(response: AxiosResponse): void {
    try {
      const methodName = 'validateGetBookingByIdResponse';
      const data = this.validateResponseData<Booking>(response, methodName);

      this.validateBooking(data);
      logger.info('Successfully validated getBookingById response');
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'validateGetBookingByIdResponse',
        'Failed to validate getBookingById response',
      );
      throw error;
    }
  }
  public static async assertBookingDetailsMatchStoredResponse(
    response: AxiosResponse,
  ): Promise<void> {
    try {
      const storedBookingResponse = TestDataStore.getValue(
        BookingMap.booking,
        TEST_CONSTANTS.TEST_IDS.bookingTestIds.STORE_BOOOKING_ID,
        'responseObject',
      ) as unknown as BookingResponse;

      if (!storedBookingResponse) {
        throw new Error('No stored booking response found for comparison.');
      }

      // Handle both possible response structures - direct booking object or nested in a BookingResponse
      const actualBooking = response.data.booking ? response.data.booking : response.data;

      // Compare the actual booking with the stored booking
      expect(actualBooking.firstname).toBe(storedBookingResponse.booking.firstname);
      expect(actualBooking.lastname).toBe(storedBookingResponse.booking.lastname);
      expect(actualBooking.totalprice).toBe(storedBookingResponse.booking.totalprice);
      expect(actualBooking.depositpaid).toBe(storedBookingResponse.booking.depositpaid);
      expect(actualBooking.bookingdates.checkin).toBe(
        storedBookingResponse.booking.bookingdates.checkin,
      );
      expect(actualBooking.bookingdates.checkout).toBe(
        storedBookingResponse.booking.bookingdates.checkout,
      );
      expect(actualBooking.additionalneeds).toBe(storedBookingResponse.booking.additionalneeds);
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'assertBookingDetailsMatchStoredResponse',
        'Failed to validate that booking details match the stored booking response.',
      );
      throw error;
    }
  }

  public static assertUpdatedBookingDetailsMatchStoredResponse(response: AxiosResponse) {
    try {
      // update booking payload
      const updatedBookingPayload = this.updateBookingPayload();

      const responseData = response.data.booking ? response.data.booking : response.data;

      expect(responseData.firstname).toBe(updatedBookingPayload.firstname);
      expect(responseData.lastname).toBe(updatedBookingPayload.lastname);
      expect(responseData.totalprice).toBe(updatedBookingPayload.totalprice);
      expect(responseData.depositpaid).toBe(updatedBookingPayload.depositpaid);
      expect(responseData.bookingdates.checkin).toBe(updatedBookingPayload.bookingdates.checkin);
      expect(responseData.bookingdates.checkout).toBe(updatedBookingPayload.bookingdates.checkout);
      expect(responseData.additionalneeds).toBe(updatedBookingPayload.additionalneeds);
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'assertUpdatedBookingDetailsMatchStoredResponse',
        'Failed to validate that updated booking details match the stored booking response.',
      );
      throw error;
    }
  }

  private static updateBookingPayload(): typeof bd.Booking {
    const payload = { ...bd.Booking };

    payload.firstname = bd.FirstNames[3];
    payload.lastname = bd.LastNames[7];

    payload.totalprice = 1850;
    payload.depositpaid = true;

    const getDates = BookingDateGenerator.createBookingDatesfromCurrentDate(10);
    payload.bookingdates.checkin = getDates.checkin;
    payload.bookingdates.checkout = getDates.checkout;

    payload.additionalneeds = bd.AdditionalNeeds[2];

    return payload;
  }
}

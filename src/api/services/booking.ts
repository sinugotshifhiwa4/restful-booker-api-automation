import { AxiosResponse } from 'axios';
import { BookingEndpointBuilder } from '../endpoints/bookingEndpointBuilder';
import { ApiClient } from '../client/apiClient';
import RequestContext from '../context/requestContext';
import BookingValidations from '../validators/bookingValidations';
import * as bd from '../../testData/bookingData.json';
import { BookingDateGenerator } from '../../testData/bookingDateGenerator';
import { TEST_CONSTANTS } from '../../utils/dataStore/testIds/index';
import { BookingTokenMap } from '../../utils/dataStore/maps/bookingMaps';
import TestDataStoreManager from '../../utils/dataStore/utils/testDataStoreManager';
import ApiResponseValidator from '../validators/apiResponseValidator';
import ApiErrorResponseBuilder from '../../utils/errors/apiErrorResponseBuilder';

export class Booking {
  private apiClient: ApiClient;
  private bookingEndpointBuilder: BookingEndpointBuilder;

  constructor(apiClient: ApiClient, bookingEndpointBuilder: BookingEndpointBuilder) {
    this.apiClient = apiClient;
    this.bookingEndpointBuilder = bookingEndpointBuilder;
  }

  public async getAllBookings(): Promise<void> {
    try {
      RequestContext.registerExpectation('getAllBookings', [200], false);

      const response = await this.apiClient.sendGetRequest(
        await this.bookingEndpointBuilder.bookingEndpoint(),
      );

      // Validate response structure and content
      BookingValidations.validateGetAllBookingsResponse(response);

      // Validate response matches expected status code
      ApiResponseValidator.validatePositiveTestResponse(response, 200, 'getAllBookings');
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'getAllBookings',
        'Failed to get all bookings',
      );
      throw error;
    }
  }

  public async createNewBooking(): Promise<void> {
    try {
      RequestContext.registerExpectation('createNewBooking', [200], false);

      const payload = this.createBookingPayload();

      // Log the request payload before sending
      //logger.info(`Creating new booking with payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await this.apiClient.sendPostRequest(
        await this.bookingEndpointBuilder.bookingEndpoint(),
        payload,
        undefined,
      );

      ApiResponseValidator.validatePositiveTestResponse(response, 200, 'createNewBooking');

      // Validate response structure and content
      BookingValidations.validateNewlyCreatedBooking(response);

      // Extract the bookingId from the response
      const bookingId = await this.getBookingIdFromResponse(response);

      // Store the bookingId in the TestDataStore
      TestDataStoreManager.setValue(
        BookingTokenMap.booking,
        TEST_CONSTANTS.TEST_IDS.bookingTestIds.CREATE_NEW_BOOKING_AND_STORE_BOOKING_ID,
        'bookingId',
        bookingId,
      );
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'createNewBooking',
        'Failed to create new booking',
      );
      throw error;
    }
  }

  public async createConcurrentNewBooking(testIdSuffix?: string): Promise<string> {
  try {
    RequestContext.registerExpectation('createNewBooking', [200], false);

    const payload = this.createBookingPayload();

    const response = await this.apiClient.sendPostRequest(
      await this.bookingEndpointBuilder.bookingEndpoint(),
      payload,
      undefined,
    );

    ApiResponseValidator.validatePositiveTestResponse(response, 200, 'createNewBooking');

    // Validate response structure and content
    BookingValidations.validateNewlyCreatedBooking(response);

    // Extract the bookingId from the response
    const bookingId = await this.getBookingIdFromResponse(response);

    // Store the bookingId in the TestDataStore with a custom test ID if provided
    const testId = testIdSuffix 
      ? `${TEST_CONSTANTS.TEST_IDS.bookingTestIds.CREATE_NEW_BOOKING_AND_STORE_BOOKING_ID}_${testIdSuffix}`
      : TEST_CONSTANTS.TEST_IDS.bookingTestIds.CREATE_NEW_BOOKING_AND_STORE_BOOKING_ID;
    
    TestDataStoreManager.setValue(
      BookingTokenMap.booking,
      testId,
      'bookingId',
      bookingId,
    );
    
    return bookingId;
  } catch (error) {
    ApiErrorResponseBuilder.captureApiError(
      error,
      'createConcurrentNewBooking',
      'Failed to create concurrent new booking',
    );
    throw error;
  }
}

  private createBookingPayload(): typeof bd.Booking {
    const payload = { ...bd.Booking };

    payload.firstname = bd.FirstNames[3];
    payload.lastname = bd.LastNames[7];

    const min = 111;
    const max = 670;
    payload.totalprice = Math.floor(Math.random() * (max - min + 1)) + min;
    payload.depositpaid = true;

    const getDates = BookingDateGenerator.createBookingDatesfromCurrentDate(4);
    payload.bookingdates.checkin = getDates.checkin;
    payload.bookingdates.checkout = getDates.checkout;

    payload.additionalneeds = bd.AdditionalNeeds[2];

    return payload;
  }

  /**
   * Extracts booking ID from response
   * @param response The Axios response object
   * @returns The booking ID string
   */
  private async getBookingIdFromResponse(response: AxiosResponse): Promise<string> {
    return BookingValidations.extractPropertyFromResponse<string>(
      response,
      'bookingid',
      'getBookingIdFromResponse',
    );
  }

  public async getBookingById(bookingId: number): Promise<void> {
    try {
      RequestContext.registerExpectation('getBookingById', [200], false);

      const response = await this.apiClient.sendGetRequest(
        await this.bookingEndpointBuilder.getBookingByIdEndpoint(bookingId),
      );

      ApiResponseValidator.validatePositiveTestResponse(response, 200, 'getBookingById');

    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'getBookingById',
        'Failed to get booking by ID',
      );
      throw error;
    }
  }
}

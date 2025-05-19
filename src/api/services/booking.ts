import { AxiosResponse } from 'axios';
import { BookingEndpointBuilder } from '../endpoints/bookingEndpointBuilder';
import { ApiClient } from '../client/apiClient';
import RequestContext from '../context/requestContext';
import BookingValidations from '../validators/bookingValidations';
import * as bd from '../../testData/bookingData.json';
import { BookingDateGenerator } from '../../testData/bookingDateGenerator';
import ApiResponseValidator from '../validators/apiResponseValidator';
import ApiErrorResponseBuilder from '../../utils/errors/apiErrorResponseBuilder';
import logger from '../../utils/logging/loggerManager';

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

  public async createNewBooking(): Promise<AxiosResponse> {
    try {
      RequestContext.registerExpectation('createNewBooking', [200], false);

      const response = await this.apiClient.sendPostRequest(
        await this.bookingEndpointBuilder.bookingEndpoint(),
        this.createBookingPayload(),
        undefined,
      );

      ApiResponseValidator.validatePositiveTestResponse(response, 200, 'createNewBooking');

      // Validate response structure and content
      BookingValidations.validateNewlyCreatedBooking(response);

      logger.debug(`Response for creating new booking: ${JSON.stringify(response.data, null, 2)}`);

      return response;
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'createNewBooking',
        'Failed to create new booking',
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

  public async getBookingById(bookingId: number): Promise<void> {
    try {
      RequestContext.registerExpectation('getBookingById', [200], false);

      const response = await this.apiClient.sendGetRequest(
        await this.bookingEndpointBuilder.getBookingByIdEndpoint(bookingId),
      );

      ApiResponseValidator.validatePositiveTestResponse(response, 200, 'getBookingById');
      BookingValidations.validateGetBookingByIdResponse(response);
      BookingValidations.assertBookingDetailsMatchStoredResponse(response);
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

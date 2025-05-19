import { AxiosResponse } from 'axios';
import { BookingEndpointBuilder } from '../endpoints/bookingEndpointBuilder';
import { ApiClient } from '../client/apiClient';
import RequestContext from '../context/requestContext';
import BookingValidations from '../validators/bookingValidations';
import * as bd from '../../testData/bookingData.json';
import { BookingDateGenerator } from '../../testData/bookingDateGenerator';
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

  public async getBookingByIdNotFound(bookingId: number): Promise<void> {
    try {
      RequestContext.registerExpectation('getBookingById', [404], true);

      const response = await this.apiClient.sendGetRequest(
        await this.bookingEndpointBuilder.getBookingByIdEndpoint(bookingId),
      );

      ApiResponseValidator.validateNegativeTestResponse(response, 404, 'getBookingById');
    } catch (error) {
      ApiErrorResponseBuilder.handleNegativeTestError(error, 'getBookingById');
    }
  }

  public async updateBookingById(bookingId: number, token: string): Promise<AxiosResponse> {
    try {
      RequestContext.registerExpectation('updateBookingById', [200], false);

      const response = await this.apiClient.sendPutRequest(
        await this.bookingEndpointBuilder.getBookingByIdEndpoint(bookingId),
        this.updateBookingPayload(),
        this.apiClient.setCookieToken(token),
      );
      ApiResponseValidator.validatePositiveTestResponse(response, 200, 'updateBookingById');

      // Validate response structure and content
      BookingValidations.validateGetBookingByIdResponse(response);
      BookingValidations.assertUpdatedBookingDetailsMatchStoredResponse(response);
      return response;
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'updateBookingById',
        'Failed to update booking by ID',
      );
      throw error;
    }
  }

  private updateBookingPayload(): typeof bd.Booking {
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

  public async partiallyUpdateBookingById(
    bookingId: number,
    token: string,
  ): Promise<AxiosResponse> {
    try {
      RequestContext.registerExpectation('partillyUpdateBookingById', [200], false);

      const response = await this.apiClient.sendPatchRequest(
        await this.bookingEndpointBuilder.getBookingByIdEndpoint(bookingId),
        this.partiallyUpdateBookingPayload(),
        this.apiClient.setCookieToken(token),
      );
      ApiResponseValidator.validatePositiveTestResponse(response, 200, 'partillyUpdateBookingById');

      // Validate response structure and content
      BookingValidations.validateGetBookingByIdResponse(response);
      BookingValidations.assertPartiallyUpdatedBookingDetailsMatchStoredResponse(response);
      return response;
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'partillyUpdateBookingById',
        'Failed to partially update booking by ID',
      );
      throw error;
    }
  }

  private partiallyUpdateBookingPayload() {
    const payload = { ...bd.Booking };

    payload.firstname = bd.FirstNames[5];
    payload.lastname = bd.LastNames[7];

    payload.totalprice = 920;
    payload.depositpaid = true;

    const getDates = BookingDateGenerator.createBookingDatesfromCurrentDate(3);
    payload.bookingdates.checkin = getDates.checkin;
    payload.bookingdates.checkout = getDates.checkout;

    payload.additionalneeds = bd.AdditionalNeeds[0];

    return payload;
  }

  public async deleteBookingById(bookingId: number, token: string): Promise<void> {
    try {
      RequestContext.registerExpectation('deleteBookingById', [201], false);

      const response = await this.apiClient.sendDeleteRequest(
        await this.bookingEndpointBuilder.getBookingByIdEndpoint(bookingId),
        this.apiClient.setCookieToken(token),
      );

      ApiResponseValidator.validatePositiveTestResponse(response, 201, 'deleteBookingById');
    } catch (error) {
      ApiErrorResponseBuilder.captureApiError(
        error,
        'deleteBookingById',
        'Failed to delete booking by ID',
      );
      throw error;
    }
  }
}

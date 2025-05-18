import { BookingEndpointBuilder } from '../endpoints/bookingEndpointBuilder';
import { ApiClient } from '../client/apiClient';
import RequestContext from '../context/requestContext';
import BookingValidations from '../validators/bookingValidations';
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
}

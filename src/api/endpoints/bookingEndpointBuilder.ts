import { ApiBaseUrlBuilder } from './apiBaseUrlBuilder';
import * as types from '../types/resourceTypes.type';
import ErrorHandler from '../../utils/errors/errorHandler';

export class BookingEndpointBuilder {
  private readonly apiBaseUrlBuilder: ApiBaseUrlBuilder;

  constructor(apiBaseUrlBuilder: ApiBaseUrlBuilder) {
    this.apiBaseUrlBuilder = apiBaseUrlBuilder;
  }

  public async tokenEndpoint() {
    try {
      const authEndpoint = `${types.ResourceEndpoints.token}`;
      return this.generateUrl(authEndpoint, 'token');
    } catch (error) {
      ErrorHandler.captureError(error, 'tokenEndpoint', 'Failed to create token endpoint');
      throw error;
    }
  }

  public async bookingEndpoint() {
    try {
      const bookingEndpoint = `${types.ResourceEndpoints.booking}`;
      return this.generateUrl(bookingEndpoint, 'booking');
    } catch (error) {
      ErrorHandler.captureError(error, 'bookingEndpoint', 'Failed to create booking endpoint');
      throw error;
    }
  }

  public async getBookingByIdEndpoint(bookingId: number) {
    try {
      this.validateParameters({ bookingId }, 'getBookingById');

      const bookingEndpoint = `${types.ResourceEndpoints.booking}/${bookingId}`;
      return this.generateUrl(bookingEndpoint, 'booking');
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'getBookingByIdEndpoint',
        'Failed to create getBookingById endpoint',
      );
      throw error;
    }
  }

  private async generateUrl(endpoint: string, resourceType: types.ResourceType): Promise<string> {
    try {
      // Ensure the builder is initialized before using it
      await this.apiBaseUrlBuilder.initializeIfNeeded();

      return this.apiBaseUrlBuilder.generateResourceUrl(endpoint, resourceType);
    } catch (error) {
      const methodName = `generate${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}Url`;
      ErrorHandler.captureError(
        error instanceof Error ? error : new Error(String(error)),
        methodName,
        `Failed to generate ${resourceType.toLowerCase()} URL`,
      );
      throw error;
    }
  }

  private validateParameters(params: types.ParameterMap, methodName: string): void {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        const errorMessage = `Parameter '${key}' is required but was not provided or is empty`;
        ErrorHandler.logAndThrow(errorMessage, `${methodName}.validateParameters`);
      }
    }
  }
}

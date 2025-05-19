import { ValidTokenResponse, BookingResponse } from './../../../models/api/booking.interface';
import { StorableObject } from '../../../models/api/testDataStore.types';

/**
 * Create and export the Booking related data stores
 */
export const BookingMap = {
  token: new Map<string, ValidTokenResponse & StorableObject>(),
  booking: new Map<string, BookingResponse & StorableObject>(),
};

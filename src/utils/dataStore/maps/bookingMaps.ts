import { ValidTokenResponse, BookingResponse } from './../../../models/api/booking.interface';

// Internal type constraint for data that can be stored
type StorableDataType = Record<string, string | number | null>;

/**
 * Create and export the PreQualification data store
 */
export const BookingTokenMap = {
  token: new Map<string, ValidTokenResponse & StorableDataType>(),
  booking: new Map<string, BookingResponse & StorableDataType>(),
};

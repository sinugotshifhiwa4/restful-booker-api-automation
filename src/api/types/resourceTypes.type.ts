// Define a type for resource types to ensure type safety
export type ResourceType = 'token' | 'booking';

// Map resource types to their API paths
export const ResourceEndpoints: Record<ResourceType, string> = {
  token: '/auth',
  booking: '/booking',
};

// Types for parameter validation
export type ValidParameterValue = string | number | boolean;
export type ParameterMap = Record<string, ValidParameterValue>;

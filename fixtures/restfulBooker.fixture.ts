import { test as baseTest, TestInfo } from '@playwright/test';
import { EnvironmentResolver } from '../src/config/environment/resolver/environmentResolver';
import { FetchCIEnvironmentVariables } from '../src/config/environment/resolver/fetchCIEnvironmentVariables';
import { FetchLocalEnvironmentVariables } from '../src/config/environment/resolver/fetchLocalEnvironmentVariables';
import { TEST_CONSTANTS } from '../src/utils/dataStore/testIds';

import { ApiClient } from '../src/api/client/apiClient';
import { ApiBaseUrlBuilder } from '../src/api/endpoints/apiBaseUrlBuilder';
import { BookingEndpointBuilder } from '../src/api/endpoints/bookingEndpointBuilder';
import { AuthenticationToken } from '../src/api/services/authenticationToken';
import { Booking } from '../src/api/services/booking';

type restfulbookerFixtures = {
  // Common
  environmentResolver: EnvironmentResolver;
  fetchCIEnvironmentVariables: FetchCIEnvironmentVariables;
  fetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables;
  testInfo: TestInfo;
  testId: typeof TEST_CONSTANTS;

  // API
  apiClient: ApiClient;
  apiBaseUrlBuilder: ApiBaseUrlBuilder;
  bookingEndpointBuilder: BookingEndpointBuilder;
  authenticationToken: AuthenticationToken;
  booking: Booking;
};

const restfulBookerTests = baseTest.extend<restfulbookerFixtures>({
  // Common
  fetchCIEnvironmentVariables: async ({}, use) => {
    await use(new FetchCIEnvironmentVariables());
  },
  fetchLocalEnvironmentVariables: async ({}, use) => {
    await use(new FetchLocalEnvironmentVariables());
  },
  environmentResolver: async (
    { fetchCIEnvironmentVariables, fetchLocalEnvironmentVariables },
    use,
  ) => {
    await use(new EnvironmentResolver(fetchCIEnvironmentVariables, fetchLocalEnvironmentVariables));
  },
  testInfo: async ({}, use) => {
    await use(baseTest.info());
  },
  testId: async ({}, use) => {
    await use(TEST_CONSTANTS);
  },

  // API
  apiClient: async ({}, use) => {
    await use(new ApiClient());
  },
  apiBaseUrlBuilder: async ({ environmentResolver }, use) => {
    await use(await ApiBaseUrlBuilder.create(environmentResolver));
  },
  bookingEndpointBuilder: async ({ apiBaseUrlBuilder }, use) => {
    await use(new BookingEndpointBuilder(apiBaseUrlBuilder));
  },
  authenticationToken: async ({ apiClient, bookingEndpointBuilder, environmentResolver }, use) => {
    await use(new AuthenticationToken(apiClient, bookingEndpointBuilder, environmentResolver));
  },
  booking: async ({ apiClient, bookingEndpointBuilder }, use) => {
    await use(new Booking(apiClient, bookingEndpointBuilder));
  },
});

export const test = restfulBookerTests;
export const expect = baseTest.expect;

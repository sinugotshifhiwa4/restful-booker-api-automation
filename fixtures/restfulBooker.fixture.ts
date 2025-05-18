import { test as baseTest, TestInfo } from '@playwright/test';
import { EnvironmentResolver } from '../src/config/environment/resolver/environmentResolver';
import { FetchCIEnvironmentVariables } from '../src/config/environment/resolver/fetchCIEnvironmentVariables';
import { FetchLocalEnvironmentVariables } from '../src/config/environment/resolver/fetchLocalEnvironmentVariables';

import { ApiClient } from '../src/api/client/apiClient';
import { ApiBaseUrlBuilder } from '../src/api/endpoints/apiBaseUrlBuilder';
import { BookingEndpointBuilder } from '../src/api/endpoints/bookingEndpointBuilder';
import { AuthenticationToken } from '../src/api/services/authenticationToken';

type restfulbookerFixtures = {
  // Common
  environmentResolver: EnvironmentResolver;
  fetchCIEnvironmentVariables: FetchCIEnvironmentVariables;
  fetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables;
  testInfo: TestInfo;

  // API
  apiClient: ApiClient;
  apiBaseUrlBuilder: ApiBaseUrlBuilder;
  bookingEndpointBuilder: BookingEndpointBuilder;
  authenticationToken: AuthenticationToken;
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
});

export const test = restfulBookerTests;
export const expect = baseTest.expect;

import EnvironmentDetector from '../../environmentDetector';
import { FetchCIEnvironmentVariables } from './fetchCIEnvironmentVariables';
import { FetchLocalEnvironmentVariables } from './fetchLocalEnvironmentVariables';
import { UserCredentials } from '../../../models/utils/userCredentials.interface';
import ErrorHandler from '../../../utils/errors/errorHandler';

export class EnvironmentResolver {
  private fetchCIEnvironmentVariables: FetchCIEnvironmentVariables;
  private FetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables;

  constructor(
    fetchCIEnvironmentVariables: FetchCIEnvironmentVariables,
    fetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables,
  ) {
    this.fetchCIEnvironmentVariables = fetchCIEnvironmentVariables;
    this.FetchLocalEnvironmentVariables = fetchLocalEnvironmentVariables;
  }

  public async getAppVersion(): Promise<string> {
    return this.getEnvironmentValue(
      () => this.fetchCIEnvironmentVariables.getAppVersion(),
      () => this.FetchLocalEnvironmentVariables.getAppVersion(),
      'getAppVersion',
      'Failed to get app version',
    );
  }

  public async getApiBaseUrl(): Promise<string> {
    return this.getEnvironmentValue(
      () => this.fetchCIEnvironmentVariables.getApiBaseUrl(),
      () => this.FetchLocalEnvironmentVariables.getApiBaseUrl(),
      'getApiBaseUrl',
      'Failed to get API base URL',
    );
  }

  public async getTokenCredentials(): Promise<UserCredentials> {
    return this.getEnvironmentValue(
      () => this.fetchCIEnvironmentVariables.getTokenCredentials(),
      () => this.FetchLocalEnvironmentVariables.getTokenCredentials(),
      'getCredentials',
      'Failed to get credentials',
    );
  }

  /**
   * Generic method to fetch environment variables based on environment
   * @param ciMethod - Method to call in CI environment
   * @param localMethod - Method to call in local environment
   * @param methodName - Name of the calling method for error tracking
   * @param errorMessage - Error message for failures
   */
  private async getEnvironmentValue<T>(
    ciMethod: () => Promise<T>,
    localMethod: () => Promise<T>,
    methodName: string,
    errorMessage: string,
  ): Promise<T> {
    try {
      return await (EnvironmentDetector.isRunningInCI() ? ciMethod() : localMethod());
    } catch (error) {
      ErrorHandler.captureError(error, methodName, errorMessage);
      throw error;
    }
  }
}

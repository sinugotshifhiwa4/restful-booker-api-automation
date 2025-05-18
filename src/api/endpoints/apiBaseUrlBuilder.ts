import type * as ResourceType from '../types/resourceTypes.type';
import { EnvironmentResolver } from '../../config/environment/resolver/environmentResolver';
import ErrorHandler from '../../utils/errors/errorHandler';
import logger from '../../utils/logging/loggerManager';

export class ApiBaseUrlBuilder {
  // Private properties
  private baseUrl: string | null = null;
  private initialized: boolean = false;
  private environmentResolver: EnvironmentResolver;

  /**
   * Constructor that accepts dependencies through injection
   * @param environmentResolver - The resolver to use for environment variables
   */
  constructor(environmentResolver: EnvironmentResolver) {
    this.environmentResolver = environmentResolver;
  }

  /**
   * Factory method for creating and initializing an ApiUrlBuilder instance
   *
   * @param environmentResolver - The resolver to use for environment variables
   * @returns {Promise<ApiUrlBuilder>} A promise that resolves with initialized ApiUrlBuilder
   * @throws Will throw an error if initialization fails
   */
  public static async create(environmentResolver: EnvironmentResolver): Promise<ApiBaseUrlBuilder> {
    const builder = new ApiBaseUrlBuilder(environmentResolver);
    await builder.initialize();
    return builder;
  }

  /**
   * Initializes the base URL for API requests by fetching it from environment variables.
   * This is the public interface for initialization.
   *
   * @returns {Promise<void>} A promise that resolves when the base URL is initialized.
   * @throws Will throw an error if the API base URL cannot be retrieved or is not set.
   */
  public async initialize(): Promise<void> {
    // Skip if already initialized
    if (this.initialized) {
      return;
    }

    try {
      const url = await this.environmentResolver.getApiBaseUrl();

      if (!url) {
        const errorMessage =
          'API Base URL is not set in the environment variable. Please check your environment configuration.';
        ErrorHandler.logAndThrow(errorMessage, 'initialize');
      }

      // Validate the URL format
      try {
        new URL(url);
      } catch (urlError) {
        const errorMessage = `${urlError} Invalid API Base URL format: ${url}`;
        ErrorHandler.logAndThrow(errorMessage, 'initialize');
      }

      logger.info(`Loaded API Base URL: ${url}`);
      this.baseUrl = url;
      this.initialized = true;
    } catch (error) {
      ErrorHandler.captureError(error, 'initialize', 'Failed to initialize API base URL');
      throw error;
    }
  }

  /**
   * Initializes the ApiUrlBuilder if it's not already initialized,
   * but doesn't throw an error if initialization fails.
   *
   * @returns {Promise<boolean>} A promise that resolves to true if initialized successfully, false otherwise
   */
  public async initializeIfNeeded(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      await this.initialize();
      return true;
    } catch (error) {
      logger.warn('Failed to initialize ApiUrlBuilder', error);
      return false;
    }
  }

  /**
   * Checks if the base URL has been initialized.
   * @returns True if the base URL is initialized, false otherwise.
   */
  public isInitialized(): boolean {
    return this.initialized && !!this.baseUrl;
  }

  /**
   * Gets the current base URL.
   * @returns The base URL string or null if not initialized.
   */
  public getBaseUrl(): string | null {
    return this.baseUrl;
  }

  /**
   * Updates the base URL after initialization.
   *
   * @param newBaseUrl - The new base URL to set
   * @throws Will throw an error if the new URL is invalid
   */
  public updateBaseUrl(newBaseUrl: string): void {
    try {
      // Validate the URL format
      new URL(newBaseUrl);
      this.baseUrl = newBaseUrl;
      this.initialized = true;
      logger.info(`Updated API Base URL: ${newBaseUrl}`);
    } catch (urlError) {
      const errorMessage = `Invalid API Base URL format: ${newBaseUrl}`;
      ErrorHandler.captureError(urlError, 'updateBaseUrl', errorMessage);
      throw urlError;
    }
  }

  /**
   * Ensures the base URL is initialized before proceeding.
   * @throws Will throw an error if the base URL is not initialized.
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.baseUrl) {
      const errorMessage = 'ApiUrlBuilder is not initialized. Call initialize() first.';
      ErrorHandler.logAndThrow(errorMessage, 'ensureInitialized');
    }
  }

  /**
   * Normalizes an endpoint by ensuring it starts with a slash.
   * @param endpoint - The endpoint to normalize.
   * @returns The normalized endpoint.
   */
  private normalizeEndpoint(endpoint: string): string {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  /**
   * Generates a URL for a given resource type by combining the base URL with the
   * provided endpoint. It logs the generated URL and returns it.
   *
   * @param endpoint - The endpoint to be combined with the base URL.
   * @param resourceType - The type of resource for which the URL is being generated.
   * @returns The generated URL as a string.
   * @throws If the builder is not initialized or an error occurs while generating the URL.
   */
  public generateResourceUrl(endpoint: string, resourceType: ResourceType.ResourceType): string {
    try {
      this.ensureInitialized();

      // Safe to assert non-null since we've checked in ensureInitialized
      const baseUrl = this.baseUrl as string;
      const normalizedEndpoint = this.normalizeEndpoint(endpoint);
      const constructedUrl = new URL(normalizedEndpoint, baseUrl).toString();

      logger.info(`${resourceType} URL generated: ${constructedUrl}`);
      return constructedUrl;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'generateResourceUrl',
        `Failed to generate ${resourceType} URL`,
      );
      throw error;
    }
  }
}

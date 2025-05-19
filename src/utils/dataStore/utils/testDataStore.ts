import ErrorHandler from '../../errors/errorHandler';
import { StorableObject } from '../../../models/api/testDataStore.types';
import logger from '../../logging/loggerManager';

export default class TestDataStore {
  /**
   * Sets a value in the data map for a given testId.
   */
  public static setValue<T extends StorableObject, K extends keyof T>(
    map: Map<string, T>,
    testId: string,
    key: K,
    value: T[K],
  ): boolean {
    if (!testId || !key) {
      ErrorHandler.logAndThrow('Invalid testId or key provided to setValue.', 'setValue');
    }

    try {
      const dataForId = map.get(testId) ?? ({} as T);
      dataForId[key] = value;
      map.set(testId, dataForId);
      logger.debug(`Key "${String(key)}" set for testId: "${testId}".`);
      return true;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'setValue',
        `Failed to set value for testId: ${testId}, key: ${String(key)}`,
      );
      throw error;
    }
  }

  /**
   * Retrieves a value from the data map for a given testId.
   */
  public static getValue<T extends StorableObject, K extends keyof T>(
    map: Map<string, T>,
    testId: string,
    key: K,
    throwIfMissing = false,
    defaultValue?: T[K],
  ): T[K] | undefined {
    if (!testId || !key) {
      throw new Error(`Invalid testId or key provided to getValue.`);
    }

    try {
      const dataForId = map.get(testId);

      // If no data exists for this testId
      if (!dataForId) {
        if (throwIfMissing) {
          const message = `No data found for testId: "${testId}".`;
          logger.error(message);
          throw new Error(message);
        }
        logger.warn(`No data found for testId: "${testId}".`);
        return defaultValue;
      }

      // If data exists but key doesn't
      if (!Object.prototype.hasOwnProperty.call(dataForId, key)) {
        if (throwIfMissing) {
          const message = `Key "${String(key)}" is not set for testId: "${testId}".`;
          logger.error(message);
          throw new Error(message);
        }
        logger.warn(`Key "${String(key)}" is not set for testId: "${testId}".`);
        return defaultValue;
      }

      return dataForId[key];
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'getValue',
        `Failed to get data for testId: ${testId}, key: ${String(key)}`,
      );
      throw error;
    }
  }

  /**
   * Checks if a specific field exists for a testId.
   */
  public static hasField<T extends StorableObject, K extends keyof T>(
    map: Map<string, T>,
    testId: string,
    key: K,
  ): boolean {
    try {
      const dataForId = map.get(testId);
      return Boolean(dataForId && Object.prototype.hasOwnProperty.call(dataForId, key));
    } catch (error) {
      ErrorHandler.captureError(
        error,
        'hasField',
        `Failed to check field for testId: ${testId}, key: ${String(key)}`,
      );
      throw error;
    }
  }

  /**
   * Checks if a testId exists in the data map.
   */
  public static hasTest<T extends StorableObject>(map: Map<string, T>, testId: string): boolean {
    try {
      return map.has(testId);
    } catch (error) {
      ErrorHandler.captureError(error, 'hasTest', `Failed to check testId: ${testId}`);
      throw error;
    }
  }

  /**
   * Removes a testId from the data map.
   */
  public static removeTest<T extends StorableObject>(map: Map<string, T>, testId: string): boolean {
    try {
      return map.delete(testId);
    } catch (error) {
      ErrorHandler.captureError(error, 'removeTest', `Failed to remove testId: ${testId}`);
      throw error;
    }
  }
}

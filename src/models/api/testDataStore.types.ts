export type StorableValue =
  | string
  | number
  | boolean
  | StorableObject
  | Array<StorableValue>
  | null
  | undefined;

export interface StorableObject {
  [key: string]: StorableValue;
}
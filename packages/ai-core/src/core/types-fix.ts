/**
 * Type fixes for strict mode compilation
 * These are helper types to handle undefined values in strict mode
 */

export type OptionalToNull<T> = T extends undefined ? null : T;

export type DeepPartialWithNull<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartialWithNull<T[P]> | null
    : T[P] | null;
};

export function toNullable<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

export function fromNullable<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

// src/services/mockClient.ts
// Simulates network latency and returns a deep copy so callers can never
// mutate the mock DB by accident (same behaviour as a real API).

export const MOCK_LATENCY_MS = 350;

export function mockResponse<T>(data: T, ms = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), ms);
  });
}

export function mockError(message: string, ms = MOCK_LATENCY_MS): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

let counter = 1000;
export const nextId = (prefix: string) => `${prefix}-${++counter}`;

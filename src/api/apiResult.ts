import { APIResponse } from '@playwright/test';

export interface ApiResult<T = unknown> {
  status: number;
  data: T;
}

/**
 * Normalises a Playwright APIResponse into { status, data }, tolerating
 * empty/non-JSON bodies (e.g. some 404s might not return a JSON body at
 * all - we don't want that to throw and crash a test that's only
 * checking the status code).
 */
export async function toApiResult<T = unknown>(res: APIResponse): Promise<ApiResult<T>> {
  const status = res.status();
  let data: T = null as unknown as T;
  try {
    data = (await res.json()) as T;
  } catch {
    // no body, or not JSON - leave data as null
  }
  return { status, data };
}
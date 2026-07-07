import { APIRequestContext } from '@playwright/test';
import { ApiResult, toApiResult } from './apiResult';

export class CartsApi {
  private readonly basePath = '/carts';

  constructor(private readonly request: APIRequestContext) {}

  async create(cart: object): Promise<ApiResult> {
    const res = await this.request.post(this.basePath, { data: cart });
    return toApiResult(res);
  }
}
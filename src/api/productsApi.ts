import { APIRequestContext } from '@playwright/test';
import { ApiResult, toApiResult } from './apiResult';

export class ProductsApi {
  private readonly basePath = '/products';

  constructor(private readonly request: APIRequestContext) {}

  async getAll(params: Record<string, string | number> = {}): Promise<ApiResult> {
    const res = await this.request.get(this.basePath, { params });
    return toApiResult(res);
  }

  async getById(id: number | string): Promise<ApiResult> {
    const res = await this.request.get(`${this.basePath}/${id}`);
    return toApiResult(res);
  }

  async getByCategory(category: string, params: Record<string, string | number> = {}): Promise<ApiResult> {
    const res = await this.request.get(`${this.basePath}/category/${category}`, { params });
    return toApiResult(res);
  }

  async getCategories(): Promise<ApiResult> {
    const res = await this.request.get(`${this.basePath}/categories`);
    return toApiResult(res);
  }

  async create(product: object): Promise<ApiResult> {
    const res = await this.request.post(this.basePath, { data: product });
    return toApiResult(res);
  }

  async update(id: number | string, product: object): Promise<ApiResult> {
    const res = await this.request.put(`${this.basePath}/${id}`, { data: product });
    return toApiResult(res);
  }

  async remove(id: number | string): Promise<ApiResult> {
    const res = await this.request.delete(`${this.basePath}/${id}`);
    return toApiResult(res);
  }
}
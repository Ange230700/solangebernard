import type { PaginationMeta } from '@repo/contracts';

export type ResponseMapper<TSource, TResponse> = (source: TSource) => TResponse;

export function mapResponse<TSource, TResponse>(
  source: TSource,
  mapper: ResponseMapper<TSource, TResponse>,
): TResponse {
  return mapper(source);
}

export function mapCollectionResponse<TSource, TItem, TKey extends string>(
  key: TKey,
  items: readonly TSource[],
  mapper: ResponseMapper<TSource, TItem>,
  pagination: PaginationMeta,
): Record<TKey, TItem[]> & { pagination: PaginationMeta } {
  return {
    [key]: items.map((item) => mapper(item)),
    pagination: { ...pagination },
  } as Record<TKey, TItem[]> & { pagination: PaginationMeta };
}

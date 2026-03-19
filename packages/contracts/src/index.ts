export type EntityId = string & {
  readonly __brand: 'EntityId';
};

export interface HealthResponse {
  status: 'ok';
}

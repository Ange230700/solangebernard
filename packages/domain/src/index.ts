import type { EntityId } from '@repo/contracts';

export function toEntityId(value: string): EntityId {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error('Entity ID cannot be empty.');
  }

  return normalized as EntityId;
}

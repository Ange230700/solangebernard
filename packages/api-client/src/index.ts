import type { HealthResponse } from '@repo/contracts';

export interface ApiClientOptions {
  baseUrl: string;
  fetch?: typeof fetch;
}

export async function getHealth(
  options: ApiClientOptions,
): Promise<HealthResponse> {
  const response = await (options.fetch ?? fetch)(
    new URL('/health', withTrailingSlash(options.baseUrl)).toString(),
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`GET /health failed with ${response.status}.`);
  }

  return (await response.json()) as HealthResponse;
}

function withTrailingSlash(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

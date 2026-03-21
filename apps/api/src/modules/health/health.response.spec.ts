import { mapHealthResponse } from './health.response';

describe('mapHealthResponse', () => {
  it('maps the internal health result to the public health contract', () => {
    expect(mapHealthResponse({ isHealthy: true })).toEqual({
      status: 'ok',
    });
  });
});

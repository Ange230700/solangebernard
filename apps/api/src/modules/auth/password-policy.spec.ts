import { isStrongPassword } from './password-policy';

describe('password-policy', () => {
  it('accepts passwords that meet the MVP strength baseline', () => {
    expect(isStrongPassword('SecurePass123!')).toBe(true);
    expect(isStrongPassword('NewSecurePass123!')).toBe(true);
  });

  it('rejects weak replacement passwords', () => {
    expect(isStrongPassword('123')).toBe(false);
    expect(isStrongPassword('abcdefgh')).toBe(false);
    expect(isStrongPassword('12345678')).toBe(false);
  });
});

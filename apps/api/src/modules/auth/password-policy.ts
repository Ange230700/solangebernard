const MIN_PASSWORD_LENGTH = 8;

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= MIN_PASSWORD_LENGTH &&
    /[A-Za-z]/u.test(password) &&
    /\d/u.test(password)
  );
}

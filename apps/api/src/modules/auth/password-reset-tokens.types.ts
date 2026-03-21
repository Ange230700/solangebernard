export interface CreatePasswordResetTokenInput {
  adminUserId: string;
  expiresAt: Date;
  tokenHash: string;
}

export interface StoredPasswordResetToken {
  id: string;
  adminUserId: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatedPasswordResetToken {
  token: string;
  issuedAt: Date;
  expiresAt: Date;
}

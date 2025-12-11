import * as Crypto from 'expo-crypto';

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

/**
 * Generates a cryptographically strong verification token that works across
 * native, web, and test environments. Falls back to random bytes if the
 * platform does not provide a native randomUUID implementation.
 */
export const generateVerificationToken = async (): Promise<string> => {
  const maybeCrypto =
    typeof globalThis !== 'undefined'
      ? ((globalThis as any).crypto as { randomUUID?: () => string } | undefined)
      : undefined;

  if (maybeCrypto?.randomUUID) {
    return maybeCrypto.randomUUID();
  }

  if (typeof (Crypto as any).randomUUID === 'function') {
    return (Crypto as any).randomUUID();
  }

  const bytes = await Crypto.getRandomBytesAsync(32);
  return toHex(bytes);
};


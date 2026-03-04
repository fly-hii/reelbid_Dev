import crypto from 'crypto';

/**
 * Wallet Integrity Module
 * 
 * Uses HMAC-SHA256 to sign wallet balances server-side.
 * On every wallet mutation, we verify the existing hash first,
 * then re-sign after the mutation. If the hash doesn't match,
 * it means the balance was tampered with outside of our APIs.
 * 
 * The HMAC secret comes from NEXTAUTH_SECRET (which never leaves the server).
 */

function getSecret(): string {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error('NEXTAUTH_SECRET is required for wallet integrity');
    return secret;
}

/**
 * Generate HMAC hash for a user's wallet state.
 * Signs: `userId|walletBalance|lockedBalance`
 */
export function signWallet(userId: string, walletBalance: number, lockedBalance: number): string {
    const payload = `${userId}|${walletBalance}|${lockedBalance}`;
    return crypto
        .createHmac('sha256', getSecret())
        .update(payload)
        .digest('hex');
}

/**
 * Verify whether the stored wallet hash matches current values.
 * Returns true if valid, false if tampered/missing.
 * 
 * If walletHash is missing (legacy users before this feature), 
 * we treat it as valid but will re-sign on next mutation.
 */
export function verifyWallet(userId: string, walletBalance: number, lockedBalance: number, storedHash?: string): boolean {
    // Legacy user that doesn't have a hash yet — allow and will be signed on next mutation
    if (!storedHash) return true;

    const expected = signWallet(userId, walletBalance, lockedBalance);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(storedHash));
}

/**
 * Validates the user's wallet integrity and throws if tampered.
 * Call this before any wallet mutation.
 */
export function assertWalletIntegrity(user: any): void {
    const userId = user._id.toString();
    const isValid = verifyWallet(userId, user.walletBalance, user.lockedBalance || 0, user.walletHash);
    if (!isValid) {
        console.error(`[SECURITY] Wallet integrity check FAILED for user ${userId}. Balance may have been tampered.`);
        throw new Error('Wallet integrity verification failed. Please contact support.');
    }
}

/**
 * Re-sign the wallet after a mutation and return the new hash.
 * Call this after updating walletBalance or lockedBalance, before user.save().
 */
export function resignWallet(user: any): string {
    const hash = signWallet(user._id.toString(), user.walletBalance, user.lockedBalance || 0);
    user.walletHash = hash;
    return hash;
}

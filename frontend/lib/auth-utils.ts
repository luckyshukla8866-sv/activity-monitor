/**
 * Auth utility helpers.
 * Provides functions to extract user info from the JWT without an API call.
 */

/**
 * Decode the JWT payload (without verification — verification is done server-side).
 * Returns null if no token or decoding fails.
 */
function decodeToken(): Record<string, any> | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch {
        return null;
    }
}

/**
 * Get the current user's username from the JWT token.
 * Returns null if not logged in.
 */
export function getCurrentUsername(): string | null {
    const payload = decodeToken();
    return payload?.sub ?? null;
}

/**
 * Get a localStorage key namespaced to the current user.
 * This ensures data isolation between different users on the same browser.
 * 
 * Example: getUserStorageKey('coach_messages') => 'coach_messages__admin'
 */
export function getUserStorageKey(baseKey: string): string {
    const username = getCurrentUsername();
    if (!username) return baseKey; // fallback (shouldn't happen if auth guard works)
    return `${baseKey}__${username}`;
}

/**
 * Clear all user-specific data from localStorage.
 * Called on logout to prevent the next user from seeing stale data.
 */
export function clearUserData(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key.startsWith('coach_messages__') ||
            key.startsWith('chat_messages__') ||
            key === 'coach_messages' ||   // legacy key cleanup
            key === 'chat_messages'        // legacy key cleanup
        )) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem('access_token');
}

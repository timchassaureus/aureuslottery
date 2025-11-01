'use client';

/**
 * Get display name for a user address
 * Returns username, telegramUsername, or truncated address
 */
export function getDisplayName(
  address: string,
  username?: string,
  telegramUsername?: string
): string {
  // Priority: username > telegramUsername > truncated address
  if (username) return username;
  if (telegramUsername) return telegramUsername;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get short address (truncated)
 */
export function getShortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}


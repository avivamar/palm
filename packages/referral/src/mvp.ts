/**
 * Referral MVP - Core 3 functions implementation
 * Following Occam's Razor principle: less is more
 */

export type ReferralConfig = {
  enabled: boolean;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  cookieDays: number;
};

export type RewardInfo = {
  referralCode: string;
  discountAmount: number;
  referrerReward: number;
  type: 'percentage' | 'fixed';
};

/**
 * ReferralMVP - Minimal viable product with just 3 core functions
 */
export class ReferralMVP {
  /**
   * Generate referral link
   * user123 -> domain.com?ref=dXNlcjEyMw==
   */
  static generateLink(userId: string, baseUrl?: string): string {
    const url = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const encodedUserId = btoa(userId);
    return `${url}?ref=${encodedUserId}`;
  }

  /**
   * Set referral cookie
   * Returns cookie string for response headers
   */
  static setCookieHeader(ref: string, days: number = 30): string {
    const maxAge = days * 24 * 60 * 60; // Convert days to seconds
    return `ref=${ref}; Max-Age=${maxAge}; HttpOnly; SameSite=Lax; Path=/`;
  }

  /**
   * Check and calculate reward
   * Returns reward info if referral is valid
   */
  static async calculateReward(
    referralCode: string,
    purchaseAmount: number,
    config: ReferralConfig,
  ): Promise<RewardInfo | null> {
    if (!config.enabled) {
      return null;
    }

    try {
      // Decode referral code to validate it (referrer user ID not used in calculation)
      atob(referralCode);

      // Calculate discount and reward based on config
      let discountAmount = 0;
      let referrerReward = 0;

      if (config.rewardType === 'percentage') {
        // Percentage-based rewards
        discountAmount = Math.floor(purchaseAmount * (config.rewardValue / 100));
        referrerReward = Math.floor(purchaseAmount * 0.1); // 10% for referrer
      } else {
        // Fixed amount rewards
        discountAmount = config.rewardValue;
        referrerReward = Math.floor(config.rewardValue * 0.5); // 50% of discount for referrer
      }

      return {
        referralCode,
        discountAmount,
        referrerReward,
        type: config.rewardType,
      };
    } catch (error) {
      console.error('Invalid referral code:', error);
      return null;
    }
  }

  /**
   * Decode referral code to get user ID
   */
  static decodeReferralCode(referralCode: string): string | null {
    try {
      return atob(referralCode);
    } catch {
      return null;
    }
  }

  /**
   * Validate referral code format
   */
  static isValidReferralCode(referralCode: string): boolean {
    try {
      const decoded = atob(referralCode);
      return decoded.length > 0;
    } catch {
      return false;
    }
  }
}

// Default configuration
export const DEFAULT_REFERRAL_CONFIG: ReferralConfig = {
  enabled: false,
  rewardType: 'percentage',
  rewardValue: 20, // 20% discount for referee, 10% reward for referrer
  cookieDays: 30,
};

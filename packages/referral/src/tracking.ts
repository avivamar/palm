/**
 * Referral tracking service
 * Handles referral link clicks and cookie management
 */

import { ReferralMVP } from './mvp';

export type TrackingData = {
  ip?: string;
  userAgent?: string;
  referer?: string;
  timestamp: Date;
};

export class ReferralTracker {
  /**
   * Track referral click and return cookie header
   */
  static async trackClick(
    referralCode: string,
    trackingData: TrackingData,
  ): Promise<string | null> {
    // Validate referral code
    if (!ReferralMVP.isValidReferralCode(referralCode)) {
      console.warn('Invalid referral code:', referralCode);
      return null;
    }

    try {
      // Log click (in production, this would update database)
      console.log('Referral click tracked:', {
        referralCode,
        referrerUserId: ReferralMVP.decodeReferralCode(referralCode),
        ...trackingData,
      });

      // Generate cookie header
      return ReferralMVP.setCookieHeader(referralCode, 30);
    } catch (error) {
      console.error('Error tracking referral click:', error);
      return null;
    }
  }

  /**
   * Get referral code from request (cookie or URL parameter)
   */
  static getReferralCode(request: Request): string | null {
    const url = new URL(request.url);

    // First check URL parameter
    const urlRef = url.searchParams.get('ref');
    if (urlRef && ReferralMVP.isValidReferralCode(urlRef)) {
      return urlRef;
    }

    // Then check cookie
    const cookie = request.headers.get('cookie');
    if (cookie) {
      const match = cookie.match(/ref=([^;]+)/);
      if (match && match[1] && ReferralMVP.isValidReferralCode(match[1])) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Check if tracking is needed based on request
   */
  static shouldTrack(request: Request): boolean {
    const url = new URL(request.url);
    const ref = url.searchParams.get('ref');

    // Only track if ref parameter exists and is valid
    return ref !== null && ref !== undefined && ReferralMVP.isValidReferralCode(ref);
  }
}

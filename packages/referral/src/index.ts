/**
 * @rolitt/referral - MVP Export
 * Minimal, pluggable referral system
 */

export { DEFAULT_REFERRAL_CONFIG, ReferralMVP } from './mvp';
export type { ReferralConfig, RewardInfo } from './mvp';

// Re-export everything for convenience
export * from './mvp';
export { ReferralTracker } from './tracking';

export type { TrackingData } from './tracking';
export * from './tracking';

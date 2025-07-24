'use client';

import { ClarityService } from './services/ClarityService';
import { KlaviyoService } from './services/KlaviyoService';
import { MetaPixel } from './services/MetaPixel';
import { TikTokPixel } from './services/TikTokPixel';

// 将所有次要分析服务打包在一起
export default function SecondaryAnalyticsBundle() {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const klaviyoCompanyId = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID;

  return (
    <>
      {clarityId && <ClarityService projectId={clarityId} />}
      {metaPixelId && <MetaPixel pixelId={metaPixelId} />}
      {tiktokPixelId && <TikTokPixel pixelId={tiktokPixelId} />}
      {klaviyoCompanyId && <KlaviyoService companyId={klaviyoCompanyId} />}
    </>
  );
}

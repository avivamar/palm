/**
 * 多语言付费引导钩子句
 * 用于在生活建议末尾添加自然的付费转化引导
 */

export const hooks = {
  zh: [
    "完整版将详细解锁你未来 90 天的情感与事业关键节点。",
    "升级后可查看 3 个月内的幸运窗口与风险预警。",
    "完整版含专属能量建议，帮助你抓住下一次转机。",
    "深度报告将揭示你的财富密码和人生转折点。",
    "专业版包含个性化的开运方案和每月运势指导。"
  ],
  en: [
    "Upgrade now to reveal your next 3‑month breakthrough window.",
    "Full report unlocks your personal opportunity and risk calendar.",
    "See your 90‑day roadmap and tailored energy tips in the full version.",
    "Premium insights reveal your hidden talents and success patterns.",
    "Unlock personalized monthly forecasts and life optimization strategies."
  ],
  ja: [
    "完全版で、次の90日間の転機とチャンスを詳細に確認しましょう。",
    "アップグレードすると、3か月先までの運勢カレンダーが解放されます。",
    "完全版には、あなた専用のエネルギーアドバイスも含まれています。",
    "プレミアム版で隠れた才能と成功パターンを発見してください。",
    "月別の詳細な運勢と人生最適化のアドバイスをご覧いただけます。"
  ]
};

/**
 * 随机选择一个钩子句
 */
export function pickHook(lang: "zh" | "en" | "ja" = "zh"): string {
  const arr = hooks[lang] || hooks.zh;
  return arr[Math.floor(Math.random() * arr.length)] || arr[0] || "完整版将详细解锁你未来 90 天的情感与事业关键节点。";
}

/**
 * 获取特定索引的钩子句（用于测试）
 */
export function getHookByIndex(lang: "zh" | "en" | "ja" = "zh", index: number): string {
  const arr = hooks[lang] || hooks.zh;
  return arr[index % arr.length] || arr[0] || "完整版将详细解锁你未来 90 天的情感与事业关键节点。";
}

/**
 * 获取所有钩子句（用于预览）
 */
export function getAllHooks(lang: "zh" | "en" | "ja" = "zh"): string[] {
  return hooks[lang] || hooks.zh;
}
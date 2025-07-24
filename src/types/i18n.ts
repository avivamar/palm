export type Language = 'en' | 'es' | 'ja' | 'zh-HK';

export type LocalizedContent = {
  [key in Language]: string
};

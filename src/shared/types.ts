/**
 * サポートされているロケール
 * 新しい言語を追加する場合は、この配列に追加するだけで全体に反映されます
 */
export const SUPPORTED_LOCALES = ["ja", "en"] as const;

/**
 * ロケール型定義
 */
export type Locale = typeof SUPPORTED_LOCALES[number];

/**
 * ロケールが有効かどうかをチェックする型ガード
 * @param locale チェックするロケール
 * @returns ロケールが有効な場合true
 */
export const isValidLocale = (locale: unknown): locale is Locale => {
  return typeof locale === "string" && SUPPORTED_LOCALES.includes(locale as Locale);
};

/**
 * デフォルトロケール
 */
export const DEFAULT_LOCALE: Locale = "ja";

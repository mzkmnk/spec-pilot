import { readConfig, writeConfig } from "../utils/config";
import { Locale, DEFAULT_LOCALE, isValidLocale } from "./types";

/**
 * ロケール設定オプション
 */
export interface LocaleConfig {
  fallback?: Locale;
}

/**
 * ロケールを解決し、必要に応じて設定を更新する
 * @param inputLocale ユーザー指定のロケール
 * @param options ロケール設定オプション
 * @returns 解決されたロケール
 */
export const resolveLocale = (inputLocale?: Locale, options: LocaleConfig = {}): Locale => {
  const config = readConfig();
  const storedLocale = isValidLocale(config.locale) ? config.locale : undefined;
  const effectiveLocale = inputLocale ?? storedLocale ?? options.fallback ?? DEFAULT_LOCALE;

  // 設定更新ロジック
  // 1. 保存されたロケールがない場合
  // 2. ユーザーが明示的にロケールを指定した場合
  if (!storedLocale || inputLocale) {
    writeConfig({ locale: effectiveLocale });
  }

  return effectiveLocale;
};

/**
 * 基本的なロケール解決（spec-requirements用）
 * 入力ロケールなしで、保存されたロケールを読み込み、必要時にデフォルトを設定
 * @param options ロケール設定オプション
 * @returns 解決されたロケール
 */
export const resolveStoredLocale = (options: LocaleConfig = {}): Locale => {
  const config = readConfig();
  const storedLocale = isValidLocale(config.locale) ? config.locale : undefined;
  const effectiveLocale = storedLocale ?? options.fallback ?? DEFAULT_LOCALE;

  // 保存されたロケールがない場合のみ設定を書き込み
  if (!storedLocale) {
    writeConfig({ locale: effectiveLocale });
  }

  return effectiveLocale;
};

import { SUPPORTED_LOCALES } from "./types";

/**
 * 言語ポリシーセクションを生成する
 * @param configFile 設定ファイルのパス
 * @returns 言語ポリシーセクションの文字列配列
 */
export const createLanguagePolicySection = (configFile: string): string[] => [
  "## Language Policy",
  `- Read locale from \`${configFile}\` as JSON (key: "locale").`,
  `- Allowed values: ${SUPPORTED_LOCALES.join(" | ")}.`,
  "- If missing, invalid, or unreadable: fallback to en and state that fallback in the output.",
  "- Thinking rule: Always reason in English; generate only in the resolved output language.",
  "- Apply the policy to all natural-language text (headings, bullet labels, explanations).",
  "- Keep code, file paths, JSON keys, and CLI commands unchanged unless explicitly requested.",
];

/**
 * spec-init用の言語ポリシーセクションを生成する
 * @param configFile 設定ファイルのパス
 * @returns 言語ポリシーセクションの文字列配列
 */
export const createInitLanguagePolicySection = (configFile: string): string[] => [
  "## Language Policy",
  `- Read locale from \`${configFile}\` as JSON (key: "locale").`,
  `- Allowed: ${SUPPORTED_LOCALES.join(" | ")} `,
  "- If missing/invalid/unreadable: fallback to en and state the fallback in the output.",
  "- Thinking rule: Always think in English; generate only in the resolved output language.",
  "- Apply to ALL natural language text (headings, bullet labels, explanations).",
  "- Keep code, file paths, and JSON keys as-is unless explicitly asked to translate.",
];

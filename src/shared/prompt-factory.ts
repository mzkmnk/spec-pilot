/**
 * プロンプトメッセージの型定義
 */
export interface PromptMessage {
  [x: string]: unknown;
  role: "user";
  content: {
    [x: string]: unknown;
    type: "text";
    text: string;
  };
}

/**
 * プロンプトレスポンスの型定義
 */
export interface PromptResponse {
  [x: string]: unknown;
  messages: PromptMessage[];
}

/**
 * プロンプトレスポンスを作成する
 * @param content プロンプトの内容
 * @returns プロンプトレスポンス
 */
export const createPromptResponse = (content: string): PromptResponse => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: content,
      },
    },
  ],
});

/**
 * プロンプトセクションを結合する
 * @param sections 結合するセクション（文字列または文字列配列）
 * @returns 結合された文字列
 */
export const joinPromptSections = (...sections: (string | string[])[]): string => {
  return sections
    .map((section) => (Array.isArray(section) ? section.join("\n") : section))
    .join("\n");
};

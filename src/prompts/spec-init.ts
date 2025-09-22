import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readConfig, writeConfig } from "../utils/config";

// Lightweight slug suggestions from free-form description
// - ASCII only, lower-case, hyphen separated
// - Removes diacritics; non-ASCII are dropped (JP-only input falls back)
// - Returns a few variants plus a timestamped option
const makeSlugSuggestions = (desc: string): string[] => {
  const cleaned = desc
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const words = cleaned
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const base = words.slice(0, 6).join("-");
  const crop = (s: string) =>
    s
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48)
      .replace(/-+$/g, "");

  const ts = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}${m}${day}-${hh}${mm}`;
  };

  const variants = new Set<string>();
  if (base) variants.add(crop(base));
  if (base) variants.add(crop(`${base}-spec`));
  if (base) variants.add(crop(`${base}-draft`));

  if (variants.size === 0) {
    variants.add(`spec-${ts()}`);
  } else {
    // Provide a time-stamped variant for quick uniqueness
    variants.add(`${Array.from(variants)[0]}-${ts()}`);
  }

  return Array.from(variants).filter(Boolean);
};

const BASE_DIR = ".kiro/specs";
const CONFIG_FILE = ".kiro/spec-pilot.json";

export const registerSpecInitPrompt = (server: McpServer) => {
  server.registerPrompt(
    "spec.init",
    {
      title: "initialize spec workspace",
      description: "仕様駆動開発用のディレクトリを初期化し、後続プロンプトの実行手順を案内する。",
      argsSchema: {
        specDescription: z
          .string()
          .min(5, "仕様の説明は5文字以上で入力してください。")
          .describe(
            "今回作成する仕様の簡潔な説明（日本語/英語可）。スラッグ候補の生成に使用します。",
          ),
        presetSlug: z
          .string()
          .optional()
          .describe("任意。フォルダ名を明示指定する場合に利用。重複時はユニーク化されます。"),
        locale: z
          .enum(["ja", "en"]) // output language
          .optional()
          .describe("出力言語（ja/en）。省略時は設定ファイルまたはja。"),
      },
    },
    async ({ specDescription, presetSlug, locale }) => {
      const config = readConfig();
      const storedLocale = typeof config.locale === "string" ? config.locale : undefined;
      const effectiveLocale = (locale ?? storedLocale ?? "ja") as "ja" | "en";

      if (!storedLocale || locale) {
        writeConfig({ locale: effectiveLocale });
      }

      const suggestions = makeSlugSuggestions(specDescription);
      const normalizedPreset = presetSlug?.trim();
      const suggested =
        normalizedPreset && normalizedPreset.length > 0 ? normalizedPreset : suggestions[0];
      const candidateList = suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n");

      const ja = [
        "これから行う作業は仕様駆動開発です。`@spec.create-requirement`、`@spec.create-design`、`@spec.create-task` の3つのプロンプトを順番に用いて requirements/design/tasks の各Markdownファイルを生成します。その初期準備として、以下の指示に従ってください。",
        "",
        `【ユーザ説明】${specDescription}`,
        "",
        "【目的】",
        `- \`${BASE_DIR}\` 配下に今回の仕様に対応する作業フォルダを作成し、以降のspecプロンプトが参照する土台を整える。`,
        "",
        "【スラッグ候補（編集可）】",
        candidateList,
        `- 推奨スラッグ: ${suggested}`,
        "",
        "【必須要件】",
        "1. `.kiro` と `.kiro/specs` ディレクトリが存在するか確認し、存在しなければ順に作成する（必ずディレクトリとして作成し、プレースホルダーファイルは置かない）。",
        `2. ユーザ説明から意味のあるスラッグを生成し、\`${BASE_DIR}/<slug>\` の形式でフォルダ名案を作る（上記候補を起点に調整可）。`,
        "3. 既存パスに同名の項目がある場合、その種別を確認する。ディレクトリであれば重複とみなし、語尾に連番や日付などを付けて一意になるまで再生成する。ファイルであればそのまま利用せず、新しいスラッグへ変更したうえでディレクトリを作成する。",
        `4. \`${BASE_DIR}/<slug>\` が確実にディレクトリとして存在するように作成・検証する（例: \`mkdir -p\`, \`test -d\`, \`stat\` で確認）。`,
        "5. ディレクトリ作成後、次に実行すべきプロンプトとして `@spec.create-requirement` を案内する（specNameには新しいフォルダ名を渡す）。",
        "6. フォルダ名や重複解消の根拠、存在確認手順を簡潔に記録し、後続のエージェントが判断しやすいようにする。",
        `7. \`${CONFIG_FILE}\` に { "locale": "${effectiveLocale}" } を保存し、以降のプロンプトが言語を共有できるようにする（既存ファイルがあれば更新する）。`,
        "",
        "【推奨シェル（POSIX, idempotent）】",
        "```sh",
        `base="${BASE_DIR}"`,
        `slug="${suggested}"`,
        'mkdir -p "$base"',
        'target="$base/$slug"',
        'if [ -e "$target" ] && [ ! -d "$target" ]; then',
        "  # 同名ファイルがある場合はタイムスタンプを付けて回避",
        '  slug="$slug-$(date +%Y%m%d%H%M)"',
        '  target="$base/$slug"',
        "fi",
        'i=1; while [ -d "$target" ]; do',
        "  # 既存ディレクトリと重複する場合は連番を付与",
        '  target="$base/$slug-$i"; i=$((i+1))',
        "done",
        'mkdir -p "$target"',
        'test -d "$target" && echo "created: $target" || { echo "failed: $target" >&2; exit 1; }',
        "```",
        "",
        "【確認ポイント】",
        `- \`${BASE_DIR}\` と \`${BASE_DIR}/${suggested}\` がディレクトリかどうかを記録する。`,
        `- \`${CONFIG_FILE}\` に保存した locale が期待通りか（例: "${effectiveLocale}"）を記載し、不整合があれば修正方法を示す。`,
        "- フォルダ作成に失敗した場合は理由とリトライ案（権限、パス誤り、競合など）を明示する。",
        "",
        "【出力フォーマット】以下のテンプレートに従って記載する。",
        "# Spec Workspace Initialization Result",
        `- folder: "<決定したフォルダ名>"`,
        `- path: "${BASE_DIR}/<フォルダ名>"`,
        '- uniquenessCheck: "<重複判定と調整内容>"',
        '- next: "Run @spec.create-requirement with specName=<フォルダ名>"',
        '- notes: "<必要に応じて補足>"',
        "",
        "フォルダ名が確定しない場合は、未確定理由と追加で必要な情報を `notes` に列挙し、再入力を促してください。",
      ].join("\n");

      const en = [
        "We will perform spec-driven development. Use `@spec.create-requirement`, `@spec.create-design`, and `@spec.create-task` in this order to generate Markdown files under requirements/design/tasks. First, follow the steps below to initialize the workspace.",
        "",
        `Input (user description): ${specDescription}`,
        "",
        "Goal",
        `- Create a working folder under \`${BASE_DIR}\` for this spec and prepare the foundation that subsequent spec prompts will reference.`,
        "",
        "Slug candidates (editable)",
        candidateList,
        `- Suggested slug: ${suggested}`,
        "",
        "Requirements",
        "1. Ensure `.kiro` and `.kiro/specs` exist; create them as directories if missing (no placeholder files).",
        `2. Generate a meaningful slug from the description and propose \`${BASE_DIR}/<slug>\` (adjust from the candidates as needed).`,
        "3. If the same path exists, check the type. If it is a directory, treat as a conflict and add a numeric or date suffix until unique. If it is a file, do not use it; choose another slug and create a directory.",
        `4. Ensure \`${BASE_DIR}/<slug>\` exists as a directory (e.g., verify with \`mkdir -p\`, \`test -d\`, \`stat\`).`,
        "5. After creation, instruct to run `@spec.create-requirement` next (pass the new folder name as specName).",
        "6. Record the rationale for the folder name, conflict resolution, and existence verification for future agents.",
        `7. Store { "locale": "${effectiveLocale}" } in \`${CONFIG_FILE}\` so later prompts can reuse the language (update the file if it already exists).`,
        "",
        "Recommended shell (POSIX, idempotent)",
        "```sh",
        `base="${BASE_DIR}"`,
        `slug="${suggested}"`,
        'mkdir -p "$base"',
        'target="$base/$slug"',
        'if [ -e "$target" ] && [ ! -d "$target" ]; then',
        '  slug="$slug-$(date +%Y%m%d%H%M)"',
        '  target="$base/$slug"',
        "fi",
        'i=1; while [ -d "$target" ]; do',
        '  target="$base/$slug-$i"; i=$((i+1))',
        "done",
        'mkdir -p "$target"',
        'test -d "$target" && echo "created: $target" || { echo "failed: $target" >&2; exit 1; }',
        "```",
        "",
        "Checks",
        `- Record whether \`${BASE_DIR}\` and \`${BASE_DIR}/${suggested}\` are directories.`,
        `- Note the locale stored in \`${CONFIG_FILE}\` (expected: "${effectiveLocale}") and describe how to correct it if mismatched.`,
        "- If creation failed, state the reason and retry plan (permissions, wrong path, conflicts, etc.).",
        "",
        "Output format (template)",
        "# Spec Workspace Initialization Result",
        `- folder: "<final folder name>"`,
        `- path: "${BASE_DIR}/<folder>"`,
        '- uniquenessCheck: "<decision and adjustment>"',
        '- next: "Run @spec.create-requirement with specName=<folder>"',
        '- notes: "<optional>"',
        "",
        "If the name is not finalized, list missing info in `notes` and request re-input.",
      ].join("\n");

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: effectiveLocale === "ja" ? ja : en,
            },
          },
        ],
      };
    },
  );
};

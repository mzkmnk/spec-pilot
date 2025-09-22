import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readConfig, writeConfig } from "../utils/config";

const BASE_DIR = ".kiro/specs";
const CONFIG_FILE = ".kiro/spec-pilot.json";

export const registerSpecInitPrompt = (server: McpServer) => {
  server.registerPrompt(
    "spec.init",
    {
      title: "initialize spec workspace",
      description: "Initialize the spec-driven development workspace and guide the follow-up prompts.",
      argsSchema: {
        specDescription: z
          .string()
          .min(5, "Please provide at least 5 characters for the spec description.")
          .describe(
            "Concise description (Japanese or English) of the spec to create. Used to derive the workspace slug.",
          ),
        locale: z
          .enum(["ja", "en"]) // output language
          .optional()
          .describe("Output language (ja/en). Defaults to stored locale or ja if absent."),
      },
    },
    async ({ specDescription, locale }) => {
      const config = readConfig();
      const storedLocale = typeof config.locale === "string" ? config.locale : undefined;
      const effectiveLocale = (locale ?? storedLocale ?? "ja") as "ja" | "en";

      if (!storedLocale || locale) {
        writeConfig({ locale: effectiveLocale });
      }

      const prompt = [
        "# Spec Workspace Initialization",

        "## Language Policy",
        `- Read locale from \`${CONFIG_FILE}\` as JSON (key: "locale").`,
        "- Allowed: ja | en ",
        "- If missing/invalid/unreadable: fallback to en and state the fallback in the output.",
        "- Thinking rule: Always think in English; generate only in the resolved output language.",
        "- Apply to ALL natural language text (headings, bullet labels, explanations).",
        "- Keep code, file paths, and JSON keys as-is unless explicitly asked to translate.",

        "## Input (User Description)",
        `${specDescription}`,

        "## Goal",
        `- Create a working folder under \`${BASE_DIR}\` for this spec and prepare the foundation that subsequent spec prompts will reference.`,

        "## Slug Guidelines",
        "- Use lowercase ASCII letters, digits, and hyphens; normalize other symbols to hyphens.",
        "- Collapse repeated hyphens; avoid leading/trailing hyphens; keep within 48 characters.",
        "- Capture the essence of the spec (domain + feature). Add `-01` or a date suffix if you need uniqueness.",

        "## Requirements",
        "1. Ensure `.kiro` and `.kiro/specs` exist; create them as directories if missing (no placeholder files).",
        `2. Decide a slug following the guidelines above and use \`${BASE_DIR}/<slug>\` as the folder path.`,
        "3. If the same path exists, check the type:",
        "   - Directory: treat as conflict and append a numeric/date suffix until unique.",
        "   - File: do not reuse; choose another slug and create a directory.",
        `4. Ensure \`${BASE_DIR}/<slug>\` exists as a directory (verify with \`mkdir -p\`, \`test -d\`, \`stat\`).`,
        "5. After creation, instruct to run `@spec.create-requirement` next (pass the new folder name as specName).",
        "6. Record the rationale for the folder name, conflict resolution, and existence verification for future agents.",
        `7. Store { "locale": "${effectiveLocale}" } in \`${CONFIG_FILE}\` so later prompts can reuse the language (update if it already exists).`,

        "## Checks",
        `- Record whether \`${BASE_DIR}\` and \`${BASE_DIR}/<slug>\` are directories.`,
        `- Note the locale stored in \`${CONFIG_FILE}\` (expected: "${effectiveLocale}") and describe how to correct it if mismatched.`,
        "- If creation failed, state the reason and a retry plan (permissions, wrong path, conflicts, etc.).",

        "## Output",
        "- IMPORTANT: Translate all headings, bullet labels, and explanatory text into the resolved output language.",
        "- Keep code fences, paths, and JSON keys unchanged.",
        "",
        "# Spec Workspace Initialization Result",
        `- folder: "<final folder name>"`,
        `- path: "${BASE_DIR}/<folder>"`,
        `- uniquenessCheck: "<decision and adjustment>"`,
        `- next: "Run @spec.create-requirement with specName=<folder>"`,
        `- notes: "<optional>"`,
        "",
        "- If the name is not finalized, list missing info in `notes` and request re-input.",
      ].join("\n");

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: prompt,
            },
          },
        ],
      };
    },
  );
};

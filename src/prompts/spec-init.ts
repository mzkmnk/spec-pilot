import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SPEC_PILOT_CONSTANTS } from "../shared/constants";
import { createInitLanguagePolicySection } from "../shared/language-policy";
import { resolveLocale } from "../shared/locale";
import { createPromptResponse, joinPromptSections } from "../shared/prompt-factory";
import { SUPPORTED_LOCALES } from "../shared/types";

export const registerSpecInitPrompt = (server: McpServer) => {
  server.registerPrompt(
    "spec.init",
    {
      title: "initialize spec workspace",
      description:
        "Initialize the spec-driven development workspace and guide the follow-up prompts.",
      argsSchema: {
        specDescription: z
          .string()
          .min(5, "Please provide at least 5 characters for the spec description.")
          .describe(
            "Concise description (Japanese or English) of the spec to create. Used to derive the workspace slug.",
          ),
        locale: z
          .enum(SUPPORTED_LOCALES)
          .optional()
          .describe(
            `Output language (${SUPPORTED_LOCALES.join("/")}). Defaults to stored locale or ja if absent.`,
          ),
      },
    },
    async ({ specDescription, locale }) => {
      const effectiveLocale = resolveLocale(locale);

      const prompt = joinPromptSections(
        "# Spec Workspace Initialization",
        "",
        createInitLanguagePolicySection(SPEC_PILOT_CONSTANTS.CONFIG_FILE),
        "",
        "## Input (User Description)",
        `${specDescription}`,
        "",
        "## Goal",
        `- Create a working folder under \`${SPEC_PILOT_CONSTANTS.BASE_DIR}\` for this spec and prepare the foundation that subsequent spec prompts will reference.`,

        "## Slug Guidelines",
        "- Use lowercase ASCII letters, digits, and hyphens; normalize other symbols to hyphens.",
        "- Collapse repeated hyphens; avoid leading/trailing hyphens; keep within 48 characters.",
        "- Capture the essence of the spec (domain + feature). Add `-01` or a date suffix if you need uniqueness.",

        "",
        "## Requirements",
        "1. Ensure `.kiro` and `.kiro/specs` exist; create them as directories if missing (no placeholder files).",
        `2. Decide a slug following the guidelines above and use \`${SPEC_PILOT_CONSTANTS.BASE_DIR}/<slug>\` as the folder path.`,
        "3. If the same path exists, check the type:",
        "   - Directory: treat as conflict and append a numeric/date suffix until unique.",
        "   - File: do not reuse; choose another slug and create a directory.",
        `4. Ensure \`${SPEC_PILOT_CONSTANTS.BASE_DIR}/<slug>\` exists as a directory (verify with \`mkdir -p\`, \`test -d\`, \`stat\`).`,
        "5. After creation, instruct to run `@spec.create-requirement` next (pass the new folder name as specName).",
        "6. Record the rationale for the folder name, conflict resolution, and existence verification for future agents.",
        `7. Store { "locale": "${effectiveLocale}" } in \`${SPEC_PILOT_CONSTANTS.CONFIG_FILE}\` so later prompts can reuse the language (update if it already exists).`,
        `8. Create \`${SPEC_PILOT_CONSTANTS.BASE_DIR}/<folder>/${SPEC_PILOT_CONSTANTS.SPEC_CONFIG_FILE}\` containing JSON with "title" set to "<folder>" (the finalized folder name) and "description" set to the provided spec description. Overwrite if it already exists to keep the latest values.`,
        "",
        "## Checks",
        `- Record whether \`${SPEC_PILOT_CONSTANTS.BASE_DIR}\` and \`${SPEC_PILOT_CONSTANTS.BASE_DIR}/<slug>\` are directories.`,
        `- Confirm \`${SPEC_PILOT_CONSTANTS.BASE_DIR}/<folder>/${SPEC_PILOT_CONSTANTS.SPEC_CONFIG_FILE}\` exists with "title" set to "<folder>" and "description" matching the provided spec description.`,
        `- Note the locale stored in \`${SPEC_PILOT_CONSTANTS.CONFIG_FILE}\` (expected: "${effectiveLocale}") and describe how to correct it if mismatched.`,
        "- If creation failed, state the reason and a retry plan (permissions, wrong path, conflicts, etc.).",
        "",
        "## Output",
        "- IMPORTANT: Translate all headings, bullet labels, and explanatory text into the resolved output language.",
        "- Keep code fences, paths, and JSON keys unchanged.",
        "",
        "# Spec Workspace Initialization Result",
        `- folder: "<final folder name>"`,
        `- path: "${SPEC_PILOT_CONSTANTS.BASE_DIR}/<folder>"`,
        `- uniquenessCheck: "<decision and adjustment>"`,
        `- next: "Run @spec.create-requirements with specName=<folder>"`,
        `- notes: "<optional>"`,
        "",
        "- If the name is not finalized, list missing info in `notes` and request re-input.",
      );

      return createPromptResponse(prompt);
    },
  );
};

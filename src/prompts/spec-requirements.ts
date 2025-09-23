import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readConfig, writeConfig } from "../utils/config";

const BASE_DIR = ".kiro/specs";
const CONFIG_FILE = ".kiro/spec-pilot.json";
const REQUIREMENTS_FILE = "requirements.md";
const SPEC_CONFIG_FILE = "config.json";

export const registerSpecRequirementsPrompt = (server: McpServer) => {
  server.registerPrompt(
    "spec.requirements",
    {
      title: "collect spec requirements",
      description: "Expand the initialized spec workspace with structured requirements.",
      argsSchema: {
        specName: z
          .string()
          .min(3, "Please provide at least 3 characters for the spec name.")
          .describe(
            "The folder name created by spec.init (slug). Used to locate the spec workspace.",
          ),
      },
    },
    async ({ specName }) => {
      const config = readConfig();
      const storedLocale = typeof config.locale === "string" ? config.locale : undefined;
      const effectiveLocale = (storedLocale ?? "ja") as "ja" | "en";

      if (!storedLocale) {
        writeConfig({ locale: effectiveLocale });
      }

      const prompt = [
        "# Spec Requirements Development",
        "",
        "## Language Policy",
        `- Read locale from \`${CONFIG_FILE}\` as JSON (key: "locale").`,
        "- Allowed values: ja | en.",
        "- If missing, invalid, or unreadable: fallback to en and state that fallback in the output.",
        "- Thinking rule: Always reason in English; generate only in the resolved output language.",
        "- Apply the policy to all natural-language text (headings, bullet labels, explanations).",
        "- Keep code, file paths, JSON keys, and CLI commands unchanged unless explicitly requested.",
        "",
        "## Inputs",
        `- specName: ${specName}`,
        "- specDescription: (read from config.json and treat as authoritative source)",
        "",
        "## Workspace Context",
        `- Base directory: \`${BASE_DIR}\``,
        `- Spec folder path: \`${BASE_DIR}/${specName}\``,
        `- Mandatory config file: \`${BASE_DIR}/${specName}/${SPEC_CONFIG_FILE}\``,
        `- Requirements file to create/update: \`${BASE_DIR}/${specName}/${REQUIREMENTS_FILE}\``,
        "",
        "## Goal",
        "- Validate the initialized spec workspace and convert the specification description into structured, testable EARS statements while matching the target requirements house style." ,
        "",
        "## Tasks",
        "1. Verify the workspace:",
        `   - Ensure \`${BASE_DIR}\` and \`${BASE_DIR}/${specName}\` are directories.`,
        `   - Confirm \`${BASE_DIR}/${specName}/${SPEC_CONFIG_FILE}\` exists, parse as JSON, and capture the current title and description for context.`,
        "   - Note any mismatches or missing metadata that could affect requirement interpretation.",
        "2. Understand the specification description:",
        "   - Summarize the description into a concise product overview paragraph for the document's Overview section.",
        "   - Extract discrete themes (core features, supporting capabilities, quality expectations, migration or testing needs) to become individual requirements.",
        "   - Capture ambiguities or missing information as potential follow-up questions.",
        "3. Develop requirements in the house style:",
        "   - Create sequential headings: `### Requirement <number>: <Short Title>` with 1-based numbering and no gaps.",
        "   - Under each heading add `**User Story:** As a ... I want ... so that ...` expressed in the resolved output language while preserving intent.",
        "   - Add `#### Acceptance Criteria` followed by a numbered list (1., 2., 3., ...).",
        "   - Every acceptance criterion must be an EARS clause such as `WHEN ... THEN THE SYSTEM SHALL ...`, `WHILE ... THE SYSTEM SHALL ...`, or `IF ... THEN THE SYSTEM SHALL ...`.",
        "   - Provide three to five acceptance criteria per requirement and introduce distinct requirement entries for architectural patterns, service separation, compatibility, and testing strategy when relevant.",
        "4. Write the Markdown document:",
        `   - Write to \`${REQUIREMENTS_FILE}\` in Markdown.`,
        "   - Structure the document exactly as:",
        "     - `# Requirements Document`",
        "     - `## Overview` (single-paragraph summary)",
        "     - `## Requirements` (containing the numbered requirement subsections)",
        "   - Do not add extra top-level sections unless explicitly required; keep supplementary explanation inside the relevant requirement body.",
        "5. Record follow-up insights:",
        "   - After the requirements list, add `## Notes` only when open questions or risks need to be highlighted; omit this section if there is nothing to report.",
        "   - Capture unresolved issues as bullet points when the Notes section is present.",
        "",
        "## Checks",
        `- Report directory checks for \`${BASE_DIR}\` and \`${BASE_DIR}/${specName}\`.`,
        `- Confirm \`${SPEC_CONFIG_FILE}\` was readable and summarize key fields (title, description).`,
        `- Verify the Markdown includes \`# Requirements Document\`, \`## Overview\`, and \`## Requirements\` in that order.`,
        "- Ensure each requirement heading follows `### Requirement <number>:` with contiguous numbering and unique titles.",
        "- Ensure every requirement contains a user story and at least three EARS-style acceptance criteria numbered 1., 2., 3., ....",
        "- Highlight missing information, blockers, or assumptions introduced during conversion and record them under `## Notes` when that section is present.",
        `- If writing failed, describe the error and propose next actions (permissions, invalid JSON, missing directories).`,
        "",
        "## Output",
        "- IMPORTANT: Translate all headings, bullet labels, and explanatory text into the resolved output language.",
        "- Keep code fences, paths, identifiers, and JSON keys unchanged.",
        "",
        "# Spec Requirements Result",
        `- specFolder: "${specName}"`,
        `- requirementsFile: "${BASE_DIR}/${specName}/${REQUIREMENTS_FILE}"`,
        `- workspaceCheck: "<directory and config validation summary>"`,
        `- highlights: "<representative requirements or decisions>"`,
        `- next: "<recommended follow-up prompt or action>"`,
        `- notes: "<open questions or blockers>"`,
        "",
        "- If the workspace is invalid or information is missing, clearly state what needs to be fixed before retrying.",
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

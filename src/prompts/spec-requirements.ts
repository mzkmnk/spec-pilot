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
        "- Allowed: ja | en",
        "- If missing/invalid/unreadable: fallback to en and state the fallback in the output.",
        "- Thinking rule: Always think in English; generate only in the resolved output language.",
        "- Apply to ALL natural language text (headings, bullet labels, explanations).",
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
        "- Validate the initialized spec workspace and convert the specification description into structured, testable EARS statements." ,
        "",
        "## Tasks",
        "1. Verify the workspace:",
        `   - Ensure \`${BASE_DIR}\` and \`${BASE_DIR}/${specName}\` are directories.`,
        `   - Confirm \`${BASE_DIR}/${specName}/${SPEC_CONFIG_FILE}\` exists, parse as JSON, and capture the current title and description for context.`,
        "   - Note any mismatches or missing metadata that could affect requirement interpretation.",
        "2. Elicit requirements from the spec description:",
        "   - Use the config description as the authoritative source of scope and intent.",
        "   - Derive functional behaviors, non-functional qualities, and explicit constraints or assumptions.",
        "   - Highlight ambiguities, missing information, or questions that require stakeholder clarification.",
        "3. Convert requirements into EARS format:",
        "   - Functional events: `WHEN <event> THEN THE SYSTEM SHALL <expected behavior>`.",
        "   - Continuous states: `WHILE <state> THE SYSTEM SHALL <expected behavior>`.",
        "   - Exceptions: `IF <undesired event> THEN THE SYSTEM SHALL <expected behavior>`.",
        "   - Keep each requirement atomic, unambiguous, and testable; assign identifiers (e.g., FR-1, NFR-1, CA-1).",
        "   - Provide a user story (As a … I want … so that …) and acceptance criteria in Given/When/Then form for every requirement.",
        "   - Classify outputs under Functional Requirements, Non-functional Requirements, and Constraints & Assumptions.",
        "4. Document the results:",
        `   - Write to \`${REQUIREMENTS_FILE}\` in Markdown.`,
        "   - Include sections: Requirements (User Story + Acceptance Criteria), Functional Requirements (EARS), Non-functional Requirements (EARS where applicable), Constraints & Assumptions, Glossary, Traceability Matrix (Requirement ID → EARS Type → Source Note).",
        "   - Populate the traceability matrix mapping each requirement ID to its EARS template type and the supporting statement from the config description.",
        "   - Summarize key insights, risks, and unresolved questions.",
        "5. Summarize the verification steps so downstream prompts understand the current workspace state.",
        "",
        "## Checks",
        `- Report directory checks for \`${BASE_DIR}\` and \`${BASE_DIR}/${specName}\`.`,
        `- Confirm \`${SPEC_CONFIG_FILE}\` was readable and summarize key fields (title, description).`,
        `- Confirm \`${REQUIREMENTS_FILE}\` now exists and contains all mandated sections, EARS-formatted statements, acceptance criteria, and traceability matrix entries.`,
        "- Highlight missing information, blockers, or assumptions introduced during conversion. Document how each requirement traces back to the config description.",
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
        `- highlights: "<key EARS requirements or decisions>"`,
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

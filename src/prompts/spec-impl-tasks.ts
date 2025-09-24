import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SPEC_PILOT_CONSTANTS } from "../shared/constants";
import { createLanguagePolicySection } from "../shared/language-policy";
import { resolveStoredLocale } from "../shared/locale";
import { createPromptResponse, joinPromptSections } from "../shared/prompt-factory";

export const registerSpecImplTasksPrompt = (server: McpServer) => {
  server.registerPrompt(
    "spec.impl-tasks",
    {
      title: "execute implementation tasks",
      description:
        "Interpret implementation tasks.md and produce an execution-ready action plan based on user-selected tasks.",
      argsSchema: {
        specName: z
          .string()
          .min(3, "Please provide at least 3 characters for the spec name.")
          .describe(
            "The folder name created by spec.init (slug). Used to locate the spec workspace.",
          ),
        tasks: z
          .string()
          .min(1, "Please describe which tasks to execute.")
          .describe(
            "Natural language selection of tasks to execute (e.g., 'run all tasks', '1-1,1-2,1-3', 'all of phase 1').",
          ),
      },
    },
    async ({ specName, tasks }) => {
      resolveStoredLocale();

      const prompt = joinPromptSections(
        "# Spec Implementation Task Execution",
        "",
        createLanguagePolicySection(SPEC_PILOT_CONSTANTS.CONFIG_FILE),
        "",
        "## Inputs",
        `- specName: ${specName}`,
        `- taskSelection: ${tasks}`,
        "- specDescription: (read from config.json; treat as authoritative context)",
        "- tasksDocument: (read from tasks.md; use numbered checklists as ground truth)",
        "",
        "## Workspace Context",
        `- Base directory: \`${SPEC_PILOT_CONSTANTS.BASE_DIR}\``,
        `- Spec folder path: \`${SPEC_PILOT_CONSTANTS.BASE_DIR}/${specName}\``,
        `- Config file: \`${SPEC_PILOT_CONSTANTS.BASE_DIR}/${specName}/${SPEC_PILOT_CONSTANTS.SPEC_CONFIG_FILE}\``,
        `- Tasks file to read/update: \`${SPEC_PILOT_CONSTANTS.BASE_DIR}/${specName}/${SPEC_PILOT_CONSTANTS.TASKS_FILE}\``,
        "",
        "## Goal",
        "- Validate the implementation workspace and translate the requested task selection into an actionable execution plan.",
        "- Provide step-by-step guidance that respects dependencies, prerequisites, and completion tracking.",
        "",
        "## Tasks",
        "1. Validate the workspace:",
        `   - Confirm \`${SPEC_PILOT_CONSTANTS.BASE_DIR}\` and \`${SPEC_PILOT_CONSTANTS.BASE_DIR}/${specName}\` exist as directories.`,
        `   - Ensure \`${SPEC_PILOT_CONSTANTS.BASE_DIR}/${specName}/${SPEC_PILOT_CONSTANTS.SPEC_CONFIG_FILE}\` is readable JSON and capture \"title\" and \"description\" for context.`,
        `   - Verify \`${SPEC_PILOT_CONSTANTS.BASE_DIR}/${specName}/${SPEC_PILOT_CONSTANTS.TASKS_FILE}\` exists; read the Markdown content for parsing.`,
        "   - Report any missing or malformed files before proceeding.",
        "",
        "2. Parse tasks.md:",
        "   - Identify major phases, numbered task hierarchies (e.g., 1, 1.1, 1.2), and checkbox status markers (`- [ ]`, `- [x]`).",
        "   - Extract requirement traceability annotations (`_req: ..._`) and associate them with tasks.",
        "   - Detect dependencies implied by numbering, bullet indentation, or explicit statements.",
        "   - Flag anomalies (missing numbers, duplicated IDs, inconsistent hierarchy) for user review.",
        "",
        "3. Interpret the task selection:",
        "   - Accept natural language instructions (e.g., 'run all tasks', 'Phase 2 only', '1-1,1-3', 'all tasks under 3').",
        "   - Support ranges (`1-3`), comma-separated lists, and qualitative descriptors (`all remaining unchecked tasks`, `completed tasks needing verification`).",
        "   - Map the request to concrete task identifiers based on the parsed hierarchy.",
        "   - When ambiguity exists, list clarifying questions instead of guessing.",
        "",
        "4. Build the execution plan:",
        "   - Respect task dependencies and prerequisites; reorder selections if dependencies appear earlier in the hierarchy.",
        "   - For each task, outline actionable steps: setup, implementation notes, verification activities, and documentation updates.",
        "   - Include testing guidance derived from each task's traceability and the design's test strategy references when present in the task description.",
        "   - Highlight required resources (files, services, credentials) and potential blockers.",
        "",
        "5. Update tracking guidance:",
        `   - Indicate how to mark tasks as complete in \`${SPEC_PILOT_CONSTANTS.TASKS_FILE}\` using checkbox updates and progress summaries.`,
        "   - Recommend capturing outcomes, code references, and follow-up notes for each executed task.",
        "   - If task execution reveals new sub-tasks or defects, instruct how to append them without breaking numbering.",
        "",
        "6. Quality and safety checks:",
        "   - Confirm the final plan covers every selected task exactly once.",
        "   - Note any gaps in requirements coverage or missing dependencies discovered during parsing.",
        "   - Provide rollback guidance if the plan touches sensitive systems or production data.",
        "   - Outline verification evidence to collect before marking tasks as completed.",
        "",
        "## Output",
        "- IMPORTANT: Translate all narrative headings, bullet labels, and explanations into the resolved output language.",
        "- Preserve code snippets, file paths, identifiers, and numeric task labels as-is unless translation improves clarity.",
        "",
        "# Spec Implementation Tasks Execution Result",
        `- specFolder: "${specName}"`,
        `- tasksFile: "${SPEC_PILOT_CONSTANTS.BASE_DIR}/${specName}/${SPEC_PILOT_CONSTANTS.TASKS_FILE}"`,
        `- selectionRequest: "${tasks}"`,
        `- workspaceCheck: "<directory, config, and tasks validation summary>"`,
        `- resolvedTasks: "<ordered list of task identifiers to execute>"`,
        `- actionPlan: "<summary of execution stages and checkpoints>"`,
        `- verification: "<tests and evidence required before completion>"`,
        `- riskNotes: "<risks, blockers, or missing data>"`,
        `- next: "Update tasks.md with execution progress or rerun @spec.impl-tasks for additional selections"`,
        "",
        "- If the workspace is invalid, the selection cannot be resolved, or required data is missing, clearly state what must be fixed before retrying.",
      );

      return createPromptResponse(prompt);
    },
  );
};

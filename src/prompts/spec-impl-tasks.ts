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
        "Execute implementation tasks by creating/modifying code files and updating progress tracking.",
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
        "## Implementation Mandate",
        "- This prompt MUST perform actual code implementation, not just planning",
        "- Each selected task MUST result in concrete file creation/modification", 
        "- TypeScript files MUST be compiled and type-checked for correctness",
        "- Tasks MUST be marked as completed [x] in tasks.md upon successful implementation",
        "",
        "## Goal",
        "- Validate the implementation workspace and EXECUTE the requested tasks completely.",
        "- Implement the selected tasks by creating/modifying code files, running tests, and updating progress tracking.",
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
        "4. Execute the selected tasks:",
        "   - For each resolved task, perform the actual implementation:",
        "     - Create or modify the required files (TypeScript, JSON, markdown, etc.)",
        "     - Write the complete code implementation based on the task description",
        "     - Run TypeScript compilation and type checking to verify correctness",
        "     - Execute any required tests or validation steps",
        "   - Follow the implementation guidelines from the design document",
        "   - Ensure all code follows TypeScript best practices and project conventions",
        "   - Respect task dependencies and prerequisites; complete prerequisites first",
        "",
        "5. Update progress tracking:",
        `   - Mark completed tasks as [x] in \`${SPEC_PILOT_CONSTANTS.TASKS_FILE}\``,
        "   - Document the implementation details (files created/modified, key decisions)",
        "   - Record any issues encountered and their resolutions",
        "   - Update requirement traceability as tasks are completed",
        "",
        "6. Build and validate:",
        "   - Run TypeScript compilation to ensure no errors",
        "   - Execute project build process if applicable",
        "   - Verify that all implemented code integrates properly",
        "   - Confirm that implemented functionality meets the task requirements",
        "",
        "7. Quality and safety checks:",
        "   - Confirm all selected tasks have been implemented and marked as complete",
        "   - Verify that no existing functionality has been broken",
        "   - Ensure all new code has proper documentation and type safety",
        "   - Report any implementation challenges or deviations from the original plan",
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
        `- resolvedTasks: "<ordered list of task identifiers executed>"`,
        `- implementedFiles: "<list of files created or modified during implementation>"`,
        `- completedTasks: "<tasks marked as [x] in tasks.md>"`,
        `- buildStatus: "<TypeScript compilation and build results>"`,
        `- verification: "<tests executed and validation results>"`,
        `- implementationNotes: "<key decisions, challenges, or deviations>"`,
        `- next: "Run @spec.impl-tasks for additional task selection, or proceed to integration/testing"`,
        "",
        "- If the workspace is invalid, the selection cannot be resolved, or required data is missing, clearly state what must be fixed before retrying.",
      );

      return createPromptResponse(prompt);
    },
  );
};

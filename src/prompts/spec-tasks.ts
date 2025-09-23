import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

export const registerSpecTasksPrompt = (server: McpServer) => {
  server.registerPrompt(
    "spec.create-tasks",
    {
      title: "create tasks",
      description: "create tasks",
      argsSchema: {
        specName: z.string().min(3, "Please provide at least 3 characters for the spec name."),
      },
    },
    async ({ specName }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Create tasks for the spec ${specName}`,
            },
          },
        ],
      };
    }
  );
}
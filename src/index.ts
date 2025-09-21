import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { load } from "./utils/load";

export const server = new McpServer({
  name: "spec-pilot",
  title: "Spec pilot",
  version: "0.0.1",
});

// test code
server.registerPrompt(
  "greeting",
  {
    title: "greeting",
    description: "greeting",
    argsSchema: {
      name: completable(z.string(), (value) => {
        return [value];
      }),
    },
  },
  async ({ name }) => ({
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: load("prompts/greeting.md"),
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `こんにちは、${name}さん。`,
        },
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);

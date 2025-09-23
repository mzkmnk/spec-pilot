#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { registerGreetingPrompt } from "./prompts/greeting";
import { registerSpecInitPrompt } from "./prompts/spec-init";
import { registerSpecRequirementsPrompt } from "./prompts/spec-requirements";

export const server = new McpServer({
  name: "spec-pilot",
  title: "Spec pilot",
  version: "0.0.1",
});

server.registerTool(
  "ping",
  {
    title: "health check",
    description: "health check",
    inputSchema: {
      message: z.string().optional(),
    },
  },
  async ({ message }) => ({
    content: [{ type: "text", text: message ?? "pong" }],
  }),
);

registerGreetingPrompt(server);
registerSpecInitPrompt(server);
registerSpecRequirementsPrompt(server);

const transport = new StdioServerTransport();
await server.connect(transport);

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { load } from "./utils/load";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const promptsDir = path.resolve(__dirname, "..", "prompts");
const filePath = path.join(promptsDir, "greeting.md");

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
  async ({ name }) => {
    if (!filePath.startsWith(promptsDir + path.sep)) {
      throw new Error("Path traversal detected");
    }
    if (!fs.existsSync(filePath)) {
      throw new Error(`同梱ファイルが見つかりません: ${filePath}`);
    }

    const md = load(filePath);

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `以下のMarkdownポリシーに従って、宛名「${name}」向けの挨拶文を1〜2文で作成してください。
            ---POLICY---
            ${md}
            ---END POLICY---
            テンプレートの \${name} を置き換え、砕けすぎない丁寧な日本語で出力してください。`,
          },
        },
        // {
        //   role: "assistant",
        //   content: {
        //     type: "text",
        //     text: "以下のドキュメント（Markdown）のポリシーに従って、挨拶文を1〜2文で作成してください。",
        //   },
        // },
        // {
        //   role: "assistant",
        //   content: {
        //     type: "resource",
        //     resource: {
        //       uri: `file://${filePath}`,
        //       name: "greeting",
        //       title: "Greeting Policy (Markdown)",
        //       mimeType: "text/markdown",
        //       text: md,
        //     },
        //   },
        // },
        // {
        //   role: "user",
        //   content: {
        //     type: "text",
        //     text: `宛名は「${name}」です。テンプレートの ${"${name}"} を置き換え、砕けすぎない丁寧な日本語で出力してください。`,
        //   },
        // },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);

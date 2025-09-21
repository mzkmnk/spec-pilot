import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";

export const registerSpecInitPrompt = (server: McpServer) => {
  server.registerPrompt(
    "spec.init",
    {
      title: "initialize spec workspace",
      description: "仕様駆動開発用のディレクトリを初期化し、後続プロンプトの実行手順を案内する。",
      argsSchema: {
        specDescription: z.string()
      }
    },
    async ({ specDescription }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                'これから行う作業は仕様駆動開発です。`@spec.create-requirement`、`@spec.create-design`、`@spec.create-task` の3つのプロンプトを順番に用いて requirements/design/tasks の各Markdownファイルを生成します。その初期準備として、以下の指示に従ってください。',
                '',
                `【ユーザ説明】${specDescription}`,
                '',
                '【目的】',
                '- `.kiro/specs` 配下に今回の仕様に対応する作業フォルダを作成し、以降のspecプロンプトが参照する土台を整える。',
                '',
                '【必須要件】',
                '1. ユーザ説明から意味のあるスラッグを生成し、`.kiro/specs/<slug>` の形式でフォルダ名案を作る。',
                '2. 既存フォルダと重複しないことを確認する。重複する場合は、語尾に連番や日付などを付けて一意になるまで再生成する。',
                '3. フォルダを作成したら、次に実行すべきプロンプトとして `@spec.create-requirement` を案内する（specNameには新しいフォルダ名を渡す）。',
                '4. フォルダ名や重複解消の根拠を簡潔に記録し、後続のエージェントが判断しやすいようにする。',
                '',
                '【確認ポイント】',
                '- `.kiro/specs` ディレクトリが存在しない場合は事前に作成する。',
                '- フォルダ作成に失敗した場合は理由とリトライ案を明示する。',
                '',
                '【出力フォーマット】以下のテンプレートに従って記載する。',
                '# Spec Workspace Initialization Result',
                '- folder: `<決定したフォルダ名>`',
                '- path: `.kiro/specs/<フォルダ名>`',
                '- uniquenessCheck: `<重複判定と調整内容>`',
                '- next: "Run @spec.create-requirement with specName=<フォルダ名>"',
                '- notes: `<必要に応じて補足>`',
                '',
                'フォルダ名が確定しない場合は、未確定理由と追加で必要な情報を `notes` に列挙し、再入力を促してください。'
              ].join('\n')
            }
          }
        ]
      }
    },
  );
};

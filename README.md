[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/mzkmnk-spec-pilot-badge.png)](https://mseep.ai/app/mzkmnk-spec-pilot)

# Spec Pilot

**スペック駆動開発をサポートするMCP (Model Context Protocol) サーバー**

Spec Pilotは、システム仕様の作成から設計まで、開発プロセス全体を構造化されたワークフローで支援するMCPサーバーです。EARS (Easy Approach to Requirements Syntax) 形式での要件定義と包括的な設計ドキュメント生成を自動化します。

## 概要

- **構造化された開発プロセス**: 仕様 → 要件 → 設計の段階的なワークフロー
- **EARS形式の要件管理**: テスト可能で明確な受け入れ基準
- **包括的な設計生成**: アーキテクチャから実装戦略まで
- **多言語サポート**: 日本語・英語での出力対応
- **MCPプロトコル**: AI エージェントとの統合が容易

## 主な機能

### 1. ワークスペース初期化 (`spec.init`)

- `.kiro/specs/<slug>` ディレクトリの作成
- プロジェクト設定ファイルの生成
- 言語設定の保存

### 2. 要件収集 (`spec.create-requirements`)

- ユーザーストーリーの構造化
- EARS形式の受け入れ基準生成
- テスト可能な要件ドキュメント作成

### 3. 設計ドキュメント生成 (`spec.design`)

- システムアーキテクチャの設計
- コンポーネント設計とAPI仕様
- 移行戦略とテスト戦略
- パフォーマンスとセキュリティ考慮事項

### 4. 挨拶機能 (`greeting`)

- 基本的な挨拶とポリシー表示

## 使用方法

Spec Pilotは4つのMCPプロンプトを提供します。各プロンプトは特定の引数を受け取り、構造化されたプロンプトを生成します。

### 利用可能なプロンプト

| プロンプト名               | 説明                 | 必須引数                   | オプション引数   |
| -------------------------- | -------------------- | -------------------------- | ---------------- |
| `greeting`                 | 挨拶とポリシー表示   | `name` (string)            | -                |
| `spec.init`                | ワークスペース初期化 | `specDescription` (string) | `locale` (ja/en) |
| `spec.create-requirements` | 要件定義生成         | `specName` (string)        | -                |
| `spec.design`              | 設計ドキュメント生成 | `specName` (string)        | -                |

### 使用例

#### Claude Desktopの場合

**プロジェクト初期化:**

```
@spec.init specDescription="ユーザー認証システムの構築" locale="ja"
```

**要件定義生成:**

```
@spec.create-requirements specName="user-auth-system"
```

**設計ドキュメント生成:**

```
@spec.design specName="user-auth-system"
```

#### Amazon Q CLIの場合

**プロジェクト初期化:**

```
@spec.init "ユーザー認証システムの構築" "ja"
```

**要件定義生成:**

```
@spec.create-requirements "user-auth-system"
```

**設計ドキュメント生成:**

```
@spec.design "user-auth-system"
```

## ファイル詳細

### グローバル設定 (`.kiro/spec-pilot.json`)

```json
{
  "locale": "ja"
}
```

### プロジェクト設定 (`config.json`)

```json
{
  "title": "project-name",
  "description": "プロジェクトの説明"
}
```

### 生成されるドキュメント

- **`requirements.md`**: EARS形式の受け入れ基準を含む構造化された要件ドキュメント
- **`design.md`**: アーキテクチャ、コンポーネント設計、移行戦略等を含む包括的な設計ドキュメント

## 設定

### サポート言語

- `ja` (日本語) - デフォルト
- `en` (英語)

言語設定は`.kiro/spec-pilot.json`ファイルで管理され、初回実行時に自動作成されます。

## 開発・ビルド

### 開発スクリプト

```bash
# 開発
pnpm build          # TypeScriptビルド
pnpm test           # テスト実行
pnpm test:watch     # テスト監視モード

# コード品質
pnpm lint           # ESLintチェック
pnpm lint:fix       # ESLint自動修正
pnpm format         # Prettierチェック
pnpm format:write   # Prettier自動フォーマット
pnpm typecheck      # 型チェック

# その他
pnpm clean          # ビルド成果物削除
```

### ビルド成果物

- `dist/index.js` - メインのMCPサーバー
- `dist/index.d.ts` - TypeScript型定義
- `prompts/` - プロンプトテンプレート

## ロードマップ

### 完了済み機能

- [x] ワークスペース初期化 (`spec.init`)
- [x] 要件定義生成 (`spec.create-requirements`)
- [x] 設計ドキュメント生成 (`spec.design`)
- [x] 多言語サポート (日本語・英語)
- [x] EARS形式の受け入れ基準生成

### 開発予定機能

- [ ] **タスク生成機能 (`spec.tasks`)** - 要件・設計からの実装タスク自動生成
  - [ ] 要件に基づく開発タスクの分解
  - [ ] 設計ドキュメントからの実装手順生成
  - [ ] GitHub Issues / プロジェクト管理ツール連携
  - [ ] 優先度付けとスケジューリング支援

- [ ] **npmパッケージ公開**
  - [ ] パッケージメタデータの最適化
  - [ ] バージョン管理自動化
  - [ ] CI/CDパイプラインによる自動公開
  - [ ] npmレジストリへの安定版リリース

## 技術仕様

- **言語**: TypeScript 5.6+
- **ランタイム**: Node.js 22+
- **パッケージマネージャー**: pnpm
- **ビルドツール**: tsdown
- **テストフレームワーク**: Vitest
- **プロトコル**: Model Context Protocol 1.18+

## ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) を参照

## 作者

mzkmnk

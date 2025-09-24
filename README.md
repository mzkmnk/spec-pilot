# Spec Pilot

**An MCP (Model Context Protocol) server that supports specification-driven development**

Spec Pilot is an MCP server that guides the entire development process with a structured workflow, from drafting system specifications through design. It automates requirement definition in the EARS (Easy Approach to Requirements Syntax) format and generates comprehensive design documents.

## Overview

- **Structured development workflow**: Step-by-step process from specifications → requirements → design
- **EARS-based requirements management**: Clear, testable acceptance criteria
- **Comprehensive design generation**: From architecture to implementation strategies
- **Multilingual support**: Output available in Japanese and English
- **MCP protocol**: Easy integration with AI agents

### Verified By

[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/mzkmnk-spec-pilot-badge.png)](https://mseep.ai/app/mzkmnk-spec-pilot)

## Key Features

### 1. Workspace Initialization (`spec.init`)

- Create the `.kiro/specs/<slug>` directory
- Generate project configuration files
- Save language settings

### 2. Requirements Collection (`spec.create-requirements`)

- Structure user stories
- Generate acceptance criteria in the EARS format
- Produce testable requirements documents

### 3. Design Document Generation (`spec.design`)

- Design system architecture
- Define component designs and API specifications
- Plan migration and testing strategies
- Address performance and security considerations

### 4. Greeting (`greeting`)

- Provide a basic greeting and display project policies

## Usage

Spec Pilot provides four MCP prompts. Each prompt accepts specific arguments and generates structured prompts.

### Available Prompts

| Prompt Name               | Description              | Required Arguments           | Optional Arguments |
| ------------------------- | ------------------------ | ---------------------------- | ------------------ |
| `greeting`                | Greeting and policy info | `name` (string)              | -                  |
| `spec.init`               | Initialize workspace     | `specDescription` (string)   | `locale` (ja/en)   |
| `spec.create-requirements`| Generate requirements    | `specName` (string)          | -                  |
| `spec.design`             | Generate design document | `specName` (string)          | -                  |

### Examples

#### Claude Desktop

**Initialize a project:**

```
@spec.init specDescription="Build a user authentication system" locale="en"
```

**Generate requirements:**

```
@spec.create-requirements specName="user-auth-system"
```

**Generate a design document:**

```
@spec.design specName="user-auth-system"
```

#### Amazon Q CLI

**Initialize a project:**

```
@spec.init "Build a user authentication system" "en"
```

**Generate requirements:**

```
@spec.create-requirements "user-auth-system"
```

**Generate a design document:**

```
@spec.design "user-auth-system"
```

## File Details

### Global Settings (`.kiro/spec-pilot.json`)

```json
{
  "locale": "ja"
}
```

### Project Settings (`config.json`)

```json
{
  "title": "project-name",
  "description": "Project description"
}
```

### Generated Documents

- **`requirements.md`**: Structured requirements document with EARS-based acceptance criteria
- **`design.md`**: Comprehensive design document covering architecture, component design, migration strategy, and more

## Configuration

### Supported Languages

- `ja` (Japanese) - default
- `en` (English)

Language settings are managed in `.kiro/spec-pilot.json`, which is created automatically during the first run.

## Development & Build

### Development Scripts

```bash
# Development
pnpm build          # TypeScript build
pnpm test           # Run tests
pnpm test:watch     # Watch mode for tests

# Code quality
pnpm lint           # Run ESLint checks
pnpm lint:fix       # Auto-fix ESLint issues
pnpm format         # Check formatting with Prettier
pnpm format:write   # Automatically format with Prettier
pnpm typecheck      # Run type checking

# Miscellaneous
pnpm clean          # Remove build artifacts
```

### Build Artifacts

- `dist/index.js` - Main MCP server
- `dist/index.d.ts` - TypeScript type definitions
- `prompts/` - Prompt templates

## Roadmap

### Completed Features

- [x] Workspace initialization (`spec.init`)
- [x] Requirements generation (`spec.create-requirements`)
- [x] Design document generation (`spec.design`)
- [x] Multilingual support (Japanese & English)
- [x] Generation of EARS-based acceptance criteria

### Planned Features

- [ ] **Task generation (`spec.tasks`)** - Automatically create implementation tasks from requirements and design
  - [ ] Break down development tasks based on requirements
  - [ ] Generate implementation steps from design documents
  - [ ] Integrate with GitHub Issues / project management tools
  - [ ] Support prioritization and scheduling

- [ ] **Publish as an npm package**
  - [ ] Optimize package metadata
  - [ ] Automate version management
  - [ ] Set up CI/CD pipelines for automated publishing
  - [ ] Release stable versions to the npm registry

## Technical Specifications

- **Language**: TypeScript 5.6+
- **Runtime**: Node.js 22+
- **Package Manager**: pnpm
- **Build Tool**: tsdown
- **Test Framework**: Vitest
- **Protocol**: Model Context Protocol 1.18+

## License

MIT License - see [LICENSE](./LICENSE) for details

## Author

mzkmnk

// Flat ESLint config for ESLint v9+
// See: https://eslint.org/docs/latest/use/configure/configuration-files-new
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default [
  // Ignore build output
  { ignores: ["dist/**"] },

  // TypeScript recommendations
  ...tseslint.configs.recommended,

  // Additional plugins and rules
  {
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "import/order": ["warn", { alphabetize: { order: "asc", caseInsensitive: true } }],
    },
  },

  // Disable stylistic rules that conflict with Prettier
  prettier,
];

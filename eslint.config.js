import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["scripts/**"]
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: process.cwd()
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      "no-console": "warn",
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
        { blankLine: "always", prev: "*", next: "if" },
        { blankLine: "always", prev: "*", next: "for" },
        { blankLine: "always", prev: "*", next: "while" },
        { blankLine: "always", prev: "*", next: "switch" },
        { blankLine: "always", prev: "*", next: "try" }
      ],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error"
    }
  }
];

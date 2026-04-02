import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "tmp/**",
  ]),
  {
    rules: {
      // Standard Next.js data-fetch on mount patterns; rule is overly strict for this codebase.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Temporarily disable quote escaping to focus on critical errors
      'react/no-unescaped-entities': 'off',
      // Allow explicit any during transition
      '@typescript-eslint/no-explicit-any': 'off',
      // Disable unused vars as warnings only
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

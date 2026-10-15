import { defineConfig, globalIgnores } from 'eslint/config';
import next from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';
export default defineConfig([...next, ...typescript, {
  rules: {
    // Auth changes need a fresh server request; private images must bypass the shared image optimizer.
    '@next/next/no-location-assign-relative-destination': 'off',
    '@next/next/no-img-element': 'off',
  },
}, globalIgnores(['.next/**', '.next-logging-check/**', '.private/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**'])]);

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, '../..');
const uiStylesDir = path.join(repoRoot, 'packages/ui/src/styles');

function resolveNerturaUiStyles(id) {
  if (id === '@nertura/ui/globals.css' || id === '@nertura/ui/styles/globals.css') {
    return path.join(uiStylesDir, 'globals.css');
  }
  return null;
}

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'postcss-import': {
      resolve(id) {
        const mapped = resolveNerturaUiStyles(id);
        if (mapped) return mapped;
        return id;
      },
    },
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;

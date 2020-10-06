module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:cypress/recommended",
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react',
    '@typescript-eslint'
  ],
  rules: {
    "semi": "warn",
    "no-prototype-builtins": "warn",
    "no-irregular-whitespace": "warn",
    "cypress/no-unnecessary-waiting": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "args": "none", "ignoreRestSiblings": true  }]
  },
  ignorePatterns: [
    "**/node_modules/**",
    "**/build/**",
    "**/config/**",
    "**/index.d.ts"
  ],
  globals: {
    JSX: "writable"
  }
}


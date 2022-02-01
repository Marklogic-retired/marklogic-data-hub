module.exports = {
  env: {
    node: true,
    jest: true,
    browser: true
    //"cypress/globals": true
  },
  extends: [
    "eslint:recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: [
    "react",
    "@typescript-eslint",
    "cypress"
  ],
  rules: {
    "no-prototype-builtins": "off",
    "no-irregular-whitespace": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {"args": "none", "ignoreRestSiblings": true}],
    //"no-console": ["error", {allow: ["warn", "error", "debug"]}],
    "curly": ["error", "multi-line"],
    "arrow-spacing": "error",
    "eqeqeq": "error",
    "array-bracket-spacing": "error",
    "block-spacing": "error",
    "brace-style": ["error", "1tbs", {"allowSingleLine": true}],
    "comma-spacing": "error",
    "computed-property-spacing": "error",
    "func-call-spacing": "error",
    "key-spacing": "error",
    "keyword-spacing": "error",
    "jsx-quotes": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    "no-trailing-spaces": "error",
    "object-curly-spacing": "error",
    "semi": "error",
    "space-in-parens": "error",
    "space-before-blocks": "error",
    "no-var": "error",
    "indent": ["error", 2]
  },
  ignorePatterns: [
    "**/node_modules/**",
    "**/build/**",
    "**/config/**",
    "**/index.d.ts",
    "**/docs/**"
  ],
  globals: {
    JSX: "writable",
  }
};


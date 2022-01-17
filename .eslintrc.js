module.exports = {
  env: {
    "browser": true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
    project: "tsconfig.eslint.json"
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [
        ".ts",
        ".tsx"
      ]
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true
      }
    },
    react: {
      version: "detect"
    }
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "airbnb",
    "plugin:prettier/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
  ],
  plugins: [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "import",
    "sort-destructure-keys",
    "jsx-a11y",
    "prettier"
  ],
  rules: {
    "default-case": "off",
    "no-shadow": "off",
    "consistent-return": "off",
    "prettier/prettier": ["error"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
    "max-classes-per-file": "off",
    "no-useless-constructor": "off",
    "no-empty-function": "off",
    "import/extensions": "off",
    "no-underscore-dangle": "off",
    "no-nested-ternary": "off",
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", ["parent", "sibling", "object", "index"]],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
        ],
        pathGroupsExcludedImportTypes: ["react"],
        "newlines-between": "never",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "react/function-component-definition": "off",
    "react/jsx-filename-extension": [2, { extensions: [".tsx"] }],
    "react/no-array-index-key": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["jest.setup.ts", "**/*.test.tsx", "**/*.spec.tsx", "**/*.test.ts", "**/*.spec.ts"]
      },
    ],
    "@typescript-eslint/prefer-readonly-parameter-types": "error"
  }
}

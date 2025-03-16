import eslintPluginReact from "eslint-plugin-react";
import babelParser from "@babel/eslint-parser";

export default [
  {
    ignores: ["node_modules/**", "dist/**"],
    files: ["src/**/*.js", "src/**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
    },
    plugins: {
      react: eslintPluginReact,
    },
    rules: {
      "no-unused-vars": "warn",
      "react/prop-types": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "warn",
    },
  },
];

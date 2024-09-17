import globals from "globals";
import pluginJs from "@eslint/js";

const treeSitterGlobals = {
  $: "readonly",
  token: "readonly",
  seq: "readonly",
  repeat: "readonly",
  repeat1: "readonly",
  choice: "readonly",
  prec: "readonly",
  field: "readonly",
  alias: "readonly",
  optional: "readonly",
  grammar: "readonly",
};
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...treeSitterGlobals,
      },
    },
  },
  pluginJs.configs.recommended,
];

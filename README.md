# tree-sitter-pact

tree-sitter grammar for pact smart contract language

## Neovim setup (WIP)

I will create a PR to add this to the official nvim-treesitter repo once it's ready, for now you can use it by following these steps:

Clone the repo

```bash
git clone https://github.com/kadena-community/tree-sitter-pact.git
```

Add those to your init.lua

```lua
vim.filetype.add({
  extension = {
    pact = "pact",
    repl = "pact",
  },
})
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.pact = {
  install_info = {
    url = "~/path/to/c/tree-sitter-pact",
    files = { "src/parser.c" },
  },
  filetype = "pact",
}
```

Then run `:TSInstall pact` in neovim.

also you need to link the queries folder to your nvim config folder

```bash
mkdir -p ~/.config/nvim/after/queries/pact
ln ./queries/highlights.scm ~/.config/nvim/after/queries/pact/highlights.scm
ln ./queries/locals.scm ~/.config/nvim/after/queries/pact/locals.scm
ln ./queries/textobjects.scm ~/.config/nvim/after/queries/pact/textobjects.scm
ln ./queries/folds.scm ~/.config/nvim/after/queries/pact/folds.scm
ln ./queries/indents.scm ~/.config/nvim/after/queries/pact/indents.scm
```

## Testing

To run the tests for the core grammar, you need to have `tree-sitter-cli` installed. You can install it with npm:

```bash
npm install -g tree-sitter-cli
```

Then, run the following command from the root of the repository:

```bash
npx tree-sitter generate && npx tree-sitter build && npx tree-sitter test
```

## Language Bindings

To run the tests for the language bindings, you will need to have the respective toolchains installed (e.g., Python, Go, Swift, Rust).

- **Rust**:

  ```bash
  cargo test
  ```

- **Swift**:

  ```bash
  swift test
  ```

- **Go**:

  ```bash
  cd bindings/go
  go get -t
  go test -v
  ```

- **Python**:
  First, create and activate a virtual environment:

  ```bash
  python -m venv .venv
  source .venv/bin/activate
  ```

  Then, install the package in editable mode with its core dependencies:

  ```bash
  pip install -e ".[core]"
  ```

  Finally, run the tests:

  ```bash
  python -m unittest discover -v -s bindings/python/tests
  ```

- **Nodejs**

  ```bash
  node bindings/node/binding_test.js
  // or
  npm run test
  ```

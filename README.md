# tree-sitter-pact

tree-sitter grammar for pact smart contract language



## Neovim setup (WIP)

I will create a PR to add this to the official nvim-treesitter repo once it's ready, for now you can use it by following these steps:

Clone the repo

``` bash
git clone https://github.com/kadena-community/tree-sitter-pact.git
```

Add those to your init.lua

``` lua
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

``` bash
mkdir -p ~/.config/nvim/after/queries/pact
ln ./queries/highlights.scm ~/.config/nvim/after/queries/pact/highlights.scm
ln ./queries/locals.scm ~/.config/nvim/after/queries/pact/locals.scm
ln ./queries/textobjects.scm ~/.config/nvim/after/queries/pact/textobjects.scm
ln ./queries/folds.scm ~/.config/nvim/after/queries/pact/folds.scm
ln ./queries/indents.scm ~/.config/nvim/after/queries/pact/indents.scm
```

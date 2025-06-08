#!/bin/bash
# set -e

# generate and build the grammar
npx tree-sitter generate

# build the grammar
npx tree-sitter build

# build the wasm bindings
npx tree-sitter build --wasm --docker

# parsing examples recursively
find examples -type f -name "*.pact" -o -name "*.repl" | while read -r file; do
  echo "Parsing $file"
  output=$(npx tree-sitter parse "$file" --quiet --stat)
  if ! echo "$output" | grep -q "failed parses: 0"; then
    echo "Failed to parse $file"
    echo "$output"
    echo "--------------------------------"
    exit 1
  fi
done

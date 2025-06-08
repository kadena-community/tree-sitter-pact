#!/bin/bash
set -e

# generate and build the grammar
npx tree-sitter generate

# build the grammar
npx tree-sitter build

# build the wasm bindings
npx tree-sitter build --wasm --docker

# parse examples
for file in examples/*.pact; do
  echo "Testing $file"
  npx tree-sitter parse $file --quiet
done

# run the parser tests
npx tree-sitter test

# run node bindings tests
npm run test

# run go bindings tests
cd bindings/go && go get -t && go test -v && cd ../..

# run swift bindings tests
swift test

# check if venv exists
if [ ! -d ".venv" ]; then
  python -m venv .venv
  source .venv/bin/activate
fi

# install pip packages
pip install -e ".[core]"

# run python bindings tests
python -m unittest discover -v -s bindings/python/tests
# run the rust bindings tests
cargo test

#!/bin/bash
# set -e

. ./parse-all.sh

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

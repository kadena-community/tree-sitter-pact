const fs = require("fs");
const Pact = require("./bindings/node");

const Parser = require("tree-sitter");

const parser = new Parser();
const query = new Parser.Query(
  Pact,
  `(defun (def_identifier) @name (parameter_list (parameter)) @params (type_annotation (type_identifier)) @return_type) @function`
);
parser.setLanguage(Pact);

function formatMatches(tree, matches) {
  return matches.map(({ pattern, captures }) => ({
    pattern,
    captures: formatCaptures(tree, captures),
  }));
}

function formatCaptures(tree, captures) {
  return captures.map((c) => {
    const node = c.node;
    delete c.node;
    c.text = tree.getText(node);
    return c;
  });
}

const sourceCode = fs.readFileSync("./test.pact").toString();
const tree = parser.parse(sourceCode);
const matches = query.matches(tree.rootNode);
console.log(
  formatMatches(tree, matches).flatMap((m) => m.captures.map((c) => c.text))
);

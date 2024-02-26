const fs = require("fs");
const Pact = require("./bindings/node");

const Parser = require("tree-sitter");

const parser = new Parser();
const query = new Parser.Query(
  Pact,
  `(module (module_identifier) @module.name)
(defcap name:(def_identifier) @capability.name
  parameters: (parameter_list)? @capability.params
  return_type: (type_identifier)? @capability.return_type
) @capability
(defun name:(def_identifier) @function.name 
  parameters: (parameter_list)? @function.params 
  return_type: (type_identifier)? @function.return_type
) @function
`
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

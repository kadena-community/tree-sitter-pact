// @ts-nocheck
const PARENS_LEFT = "(";
const PARENS_RIGHT = ")";
const ATOM = token(/[a-zA-Z%#+\-_&$@<>=?*!|/][a-zA-Z0-9%#+\-_&$@<>=?*!|/]*/);

const WHITESPACE_CHAR =
  /[\f\n\r\t ,\u000B\u001C\u001D\u001E\u001F\u2028\u2029\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2008\u2009\u200A\u205F\u3000]/;

const WHITESPACE = token(repeat1(WHITESPACE_CHAR));
// comments start with a semicolon and end with a newline
//
const COMMENT = token(seq(";", /.*/));
const INTEGER = token(seq(optional("-"), /\d+/));
const DECIMAL = token(seq(optional("-"), /\d+\.\d+/));
const BOOLEAN = token(choice("false", "true"));
const STRING = token(
  seq(
    '"', // Beginning double quote
    repeat(
      choice(
        /[^"\\]+/, // Match any character except double quote or backslash
        /\\./, // Match escaped characters (e.g., \n, \", \\)
        /\\\n[\s\S]*/, // Match backslash followed by newline and then any character, including newlines
      ),
    ),
    '"', // Ending double quote
  ),
);

const SYMBOL = token(
  seq(
    "'", // Starting with an apostrophe
    /[^\s\t\n\r,:."'\[\]()]+/, // Continuing with characters that are not whitespace or specified punctuation
  ),
);

const PREC = {
  DOC: 5,
  SPECIAL_FORM: 10,
  LITERAL: 15,
};

module.exports = grammar({
  name: "pact",
  extras: ($) => [$._ws, $.comment],
  conflicts: ($) => [
    [$._literal, $.doc],
    [$._from, $.s_expression],
  ],
  word: ($) => $.atom,
  rules: {
    source_file: ($) =>
      repeat(choice($.namespace, $.s_expression, $.use, $.module, $.interface)),
    _ws: ($) => WHITESPACE,
    comment: ($) => COMMENT,

    // literals
    integer_literal: ($) => INTEGER,
    decimal_literal: ($) => DECIMAL,
    string_literal: ($) => STRING,
    boolean_literal: ($) => BOOLEAN,
    symbol_literal: ($) => SYMBOL,
    list_literal: ($) => seq("[", repeat($._from), "]"),
    object_literal: ($) => seq("{", repeat(choice($.key_value_pair)), "}"),
    _literal: ($) =>
      prec(
        PREC.LITERAL,
        choice(
          $.boolean_literal,
          $.integer_literal,
          $.decimal_literal,
          $.string_literal,
          $.list_literal,
          $.object_literal,
          $.symbol_literal,
          $.atom,
        ),
      ),
    _from: ($) => choice($._literal, $.let_binding, $.cond, $.s_expression),
    s_expression: ($) =>
      seq(
        PARENS_LEFT,
        field("head", $.atom),
        optional(field("tail", repeat($._from))),
        PARENS_RIGHT,
      ),
    atom: ($) => ATOM,
    // delimiter: ($) => choice(".", ",", ":", "::"),

    // helpers
    type_identifier: ($) =>
      choice(
        "integer",
        "decimal",
        "time",
        "bool",
        "string",
        "list",
        "value",
        "keyset",
        "guard",
        seq(
          optional(choice("object", "table")),
          "{",
          field("type_param", $.atom),
          "}",
        ),
        "object",
        "table",
      ),
    arg_list: ($) => seq(PARENS_LEFT, optional(repeat($.arg)), PARENS_RIGHT),
    arg: ($) =>
      prec.left(
        1,
        seq(
          field("name", $.atom),
          optional(seq(":", field("type", $.type_identifier))),
        ),
      ),
    key_value_pair: ($) =>
      seq(
        field("key", choice($.string_literal, $.symbol_literal)),
        choice(":=", ":"),
        field("value", $._from),
      ),
    _doc_or_meta: ($) =>
      repeat1(
        choice(
          field("model", $.model),
          field("doc", $.doc),
          field("managed", $.managed),
          field("meta", $.meta),
        ),
      ),

    // special forms
    // <string> or @doc <string>
    doc: ($) => choice(seq("@doc", $.string_literal), $.string_literal),
    model: ($) =>
      seq("@model", "[", repeat(choice($.defproperty, $._from)), "]"),
    defproperty: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "defproperty",
          field("name", $.atom),
          optional(field("args", $.arg_list)),
          field("body", repeat($._from)),
          PARENS_RIGHT,
        ),
      ),
    managed: ($) =>
      prec.left(
        1,
        seq(
          "@managed",
          field("args", optional($._literal)),
          field("manager", optional($.atom)),
        ),
      ),
    // any other meta starts with @
    meta: ($) => prec.left(1, seq("@", $.atom)),

    namespace: ($) =>
      seq(
        PARENS_LEFT,
        "namespace",
        field("namespace", choice($.string_literal, $.symbol_literal)),
        PARENS_RIGHT,
      ),

    // @model  <sexpr>
    // model: ($) => seq("@model", $._from),
    // (bless HASH)
    bless: ($) =>
      seq(PARENS_LEFT, "bless", field("hash", $.string_literal), PARENS_RIGHT),

    //(defun NAME ARGLIST [DOC-OR-META] BODY...)
    defun: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "defun",
          seq(
            field("name", $.atom),
            optional(seq(":", field("return_type", $.type_identifier))),
          ),
          field("args", $.arg_list),
          optional($._doc_or_meta),
          field("body", repeat($._from)),
          PARENS_RIGHT,
        ),
      ),
    // (defcap NAME ARGLIST [DOC] BODY...)
    defcap: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "defcap",
          seq(
            field("name", $.atom),
            optional(seq(":", field("return_type", $.type_identifier))),
          ),
          field("args", $.arg_list),
          optional($._doc_or_meta),
          field("body", repeat($._from)),
          PARENS_RIGHT,
        ),
      ),
    // (defconst NAME VALUE [DOC-OR-META])
    defconst: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "defconst",
          field("name", $.atom),
          field("value", $._from),
          optional($._doc_or_meta),
          PARENS_RIGHT,
        ),
      ),
    // (defpact NAME ARGLIST [DOC-OR-META] STEPS...)
    defpact: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "defpact",
          seq(
            field("name", $.atom),
            optional(seq(":", field("return_type", $.type_identifier))),
          ),
          field("args", $.arg_list),
          optional($._doc_or_meta),
          field("steps", repeat(choice($.step, $.step_with_rollback))),
          PARENS_RIGHT,
        ),
      ),
    // (defschema NAME [DOC-OR-META] FIELDS...)
    defschema: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "defschema",
          field("name", $.atom),
          optional($._doc_or_meta),
          field("fields", repeat($.arg)),
          PARENS_RIGHT,
        ),
      ),
    // (deftable NAME[:SCHEMA] [DOC-OR-META])
    deftable: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "deftable",
          seq(field("name", $.atom), ":", "{", field("schema", $.atom), "}"),
          optional($._doc_or_meta),
          PARENS_RIGHT,
        ),
      ),
    let_bind_pair: ($) =>
      seq(
        PARENS_LEFT,
        field("key", $.atom),
        field("value", $._from),
        PARENS_RIGHT,
      ),
    _let_bind_pairs: ($) =>
      seq(PARENS_LEFT, repeat($.let_bind_pair), PARENS_RIGHT),
    // (let (BINDPAIR [BINDPAIR [...]]) BODY)
    // (let* (BINDPAIR [BINDPAIR [...]]) BODY)
    let_binding: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          choice("let", "let*"),
          field("bind_pairs", $._let_bind_pairs),
          field("body", $._from),
          PARENS_RIGHT,
        ),
      ),
    // (cond (TEST BRANCH) [(TEST2 BRANCH2) [...]] ELSE-BRANCH)
    cond: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "cond",
          repeat(
            seq(
              PARENS_LEFT,
              field("test", $.s_expression),
              field("branch", $._from),
              PARENS_RIGHT,
            ),
          ),
          field("else_branch", $._from),
          PARENS_RIGHT,
        ),
      ),
    // (step EXPR)
    // (step ENTITY EXPR)
    step: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "step",
          field("entity", optional($.atom)),
          field("expr", $._from),
          PARENS_RIGHT,
        ),
      ),
    // (step-with-rollback EXPR ROLLBACK-EXPR)
    // (step-with-rollback ENTITY EXPR ROLLBACK-EXPR)
    step_with_rollback: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "step-with-rollback",
          field("entity", optional($.atom)),
          field("expr", $._from),
          field("rollback_expr", $._from),
          PARENS_RIGHT,
        ),
      ),
    // (use MODULE)
    // (use MODULE HASH)
    // (use MODULE IMPORTS)
    // (use MODULE HASH IMPORTS)
    use: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "use",
          field("module", $.atom),
          optional(
            choice(
              seq(
                field("hash", $.string_literal),
                field("imports", choice($.string_literal, $.atom)),
              ),
              field("imports", choice($.string_literal, $.atom)),
            ),
          ),
          PARENS_RIGHT,
        ),
      ),
    // (interface NAME [DOR-OR-META] BODY...)
    interface: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "interface",
          field("name", $.atom),
          optional($._doc_or_meta),
          field(
            "body",
            repeat(
              choice(
                $.defun,
                $.defconst,
                $.defschema,
                $.defpact,
                $.defcap,
                $.use,
              ),
            ),
          ),
          PARENS_RIGHT,
        ),
      ),
    // (module NAME KEYSET-OR-GOVERNANCE [DOC-OR-META] BODY...)
    module: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "module",
          field("name", $.atom),
          field(
            "governance",
            choice($.atom, $.string_literal, $.symbol_literal),
          ),
          optional($._doc_or_meta),
          field(
            "body",
            repeat(
              choice(
                $.bless,
                $.use,
                $.implements,
                $.defun,
                $.defconst,
                $.defschema,
                $.defpact,
                $.defcap,
                $.deftable,
              ),
            ),
          ),
          PARENS_RIGHT,
        ),
      ),
    // (implements INTERFACE)
    implements: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "implements",
          field("interface", $.atom),
          PARENS_RIGHT,
        ),
      ),
  },
});

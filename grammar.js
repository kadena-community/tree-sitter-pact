// @ts-nocheck
const PARENS_LEFT = "(";
const PARENS_RIGHT = ")";
const ATOM = token(/[a-zA-Z%#+\-_&$@<>=?*!|/][a-zA-Z0-9%#+\-_&$@<>=?*!|/]*/);

const WHITESPACE = /[\s\p{Zs}\uFEFF\u2028\u2029\u2060\u200B]/;
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
        /\\\n[\s\S]*/ // Match backslash followed by newline and then any character, including newlines
      )
    ),
    '"' // Ending double quote
  )
);

const SYMBOL = token(
  seq(
    "'", // Starting with an apostrophe
    // eslint-disable-next-line no-useless-escape
    /[^\s\t\n\r,:."'\[\]()]+/ // Continuing with characters that are not whitespace or specified punctuation
  )
);

const PREC = {
  DOC: 20,
  SPECIAL_FORM: 10,
  LITERAL: 15,
};

/**
 * Creates a rule to match one or more of the rules separated by a comma
 * @param {Rule} rule
 * @return {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 * @param {Rule} rule
 * @return {ChoiceRule}
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

function listOf(rule) {
  return choice(seq("[", repeat(rule), "]"), seq("[", commaSep(rule), "]"));
}

function withParens(rules) {
  const r = Array.isArray(rules) ? rules : [rules];
  return seq(PARENS_LEFT, ...r, PARENS_RIGHT);
}

module.exports = grammar({
  name: "pact",
  extras: ($) => [$.comment, WHITESPACE],
  conflicts: ($) => [[$.list]],
  // supertypes: ($) => [$.s_expression],
  word: ($) => $.atom,
  rules: {
    source_file: ($) =>
      repeat(choice($.namespace, $.s_expression, $.use, $.module, $.interface)),
    comment: () => COMMENT,

    // literals
    integer: () => INTEGER,
    decimal: () => DECIMAL,
    string: () => STRING,
    boolean: () => BOOLEAN,
    symbol: () => SYMBOL,
    list: ($) => listOf($._from),
    object: ($) => seq("{", commaSep(choice($.pair, $.bind_pair)), "}"),
    _literal: ($) =>
      prec(
        PREC.LITERAL,
        choice(
          $.boolean,
          $.integer,
          $.decimal,
          $.string,
          $.list,
          $.object,
          $.symbol,
          $.atom,
          $.reference
        )
      ),
    _from: ($) =>
      prec.left(
        PREC.LITERAL,
        choice($._literal, $.let_binding, $.cond, $.s_expression)
      ),
    s_expression: ($) =>
      withParens(
        seq(
          field("head", alias($.reference, $.s_expression_head)),
          optional(field("tail", repeat($._from)))
        )
      ),
    atom: () => ATOM,
    reference: ($) => prec(20, seq($.atom, repeat(seq(".", $.atom)))),
    // _delimiter: ($) => choice(".", ",", ":", "::"),
    // object{type_parameter}, table{type_parameter}
    _parametrized_object: ($) =>
      prec(
        40,
        seq(
          optional(choice("object", "table")),
          "{",
          field("type_parameter", alias($.reference, $.type_parameter)),
          "}"
        )
      ),
    // [object{type_parameter}]
    _parametrized_list: ($) =>
      prec(
        40,
        seq(
          "[",
          field("type_parameter", alias($.type_identifier, $.type_parameter)),
          "]"
        )
      ),
    type_identifier: ($) =>
      prec.left(
        20,
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
          $._parametrized_object,
          $._parametrized_list,
          "object",
          "table"
        )
      ),
    type_annotation: ($) => seq(":", $.type_identifier),
    parameter_list: ($) => withParens(optional(repeat($.parameter))),
    parameter: ($) =>
      seq(
        field("name", alias($.atom, $.parameter_identifier)),
        field("type", optional($.type_annotation))
      ),
    schema_field_list: ($) => repeat1($.schema_field),
    schema_field: ($) =>
      seq(
        field("name", alias($.atom, $.schema_field_identifier)),
        field("type", optional($.type_annotation))
      ),
    pair: ($) =>
      seq(field("key", $._property_name), ":", field("value", $._from)),
    bind_pair: ($) =>
      seq(field("key", $._property_name), ":=", field("value", $._from)),

    _property_name: ($) =>
      alias(choice($.string, $.symbol), $.property_identifier),
    _def_name: ($) => alias($.atom, $.def_identifier),
    _doc_or_meta: ($) =>
      prec.right(
        PREC.DOC,
        repeat1(
          choice(
            field("doc", $.doc),
            field("model", $.model),
            field("managed", $.managed),
            field("event", $.event),
            field("meta", $.meta)
          )
        )
      ),

    // special forms
    // <string> or @doc <string>
    doc: ($) =>
      prec.right(
        PREC.DOC,
        choice(
          seq("@doc", alias($.string, $.doc_string)),
          alias($.string, $.doc_string)
        )
      ),
    model: ($) =>
      seq(
        "@model",
        "[",
        field("body", repeat(choice($.defproperty, $.s_expression))),
        "]"
      ),
    defproperty: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens(
          seq(
            "defproperty",
            field("name", $._def_name),
            optional(field("parameters", $.parameter_list)),
            field("body", repeat($._from))
          )
        )
      ),
    managed: ($) =>
      prec.left(
        1,
        seq(
          "@managed",
          field("args", optional($._literal)),
          field("manager", optional($.atom))
        )
      ),
    event: ($) => seq("@event", $.boolean),
    // any other meta starts with @
    meta: ($) => prec.left(1, seq("@", $.atom)),
    namespace: ($) =>
      seq(
        PARENS_LEFT,
        "namespace",
        field("namespace", choice($.string, $.symbol)),
        PARENS_RIGHT
      ),

    // @model  <sexpr>
    // model: ($) => seq("@model", $._from),
    // (bless HASH)
    bless: ($) =>
      seq(PARENS_LEFT, "bless", field("hash", $.string), PARENS_RIGHT),

    //(defun NAME ARGLIST [DOC-OR-META] BODY...)
    defun: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "defun",
          seq(
            field("name", $._def_name),
            field("return_type", optional($.type_annotation))
          ),
          field("parameters", $.parameter_list),
          optional($._doc_or_meta),
          field("body", repeat($._from)),
          PARENS_RIGHT
        )
      ),
    // (defcap NAME ARGLIST [DOC] BODY...)
    defcap: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "defcap",
          seq(
            field("name", $._def_name),
            field("return_type", optional($.type_annotation))
          ),
          field("parameters", $.parameter_list),
          optional($._doc_or_meta),
          field("body", repeat($._from)),
          PARENS_RIGHT
        )
      ),
    // (defconst NAME VALUE [DOC-OR-META])
    defconst: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "defconst",
          field("name", $._def_name),
          field("body", $._from),
          optional($._doc_or_meta),
          PARENS_RIGHT
        )
      ),
    // (defpact NAME ARGLIST [DOC-OR-META] STEPS...)
    defpact: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "defpact",
          seq(
            field("name", $._def_name),
            field("return_type", optional($.type_annotation))
          ),
          field("parameters", $.parameter_list),
          optional($._doc_or_meta),
          field("body", repeat(choice($.step, $.step_with_rollback))),
          PARENS_RIGHT
        )
      ),
    // (defschema NAME [DOC-OR-META] FIELDS...)
    defschema: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "defschema",
          field("name", $._def_name),
          optional($._doc_or_meta),
          field("fields", $.schema_field_list),
          PARENS_RIGHT
        )
      ),
    // (deftable NAME[:SCHEMA] [DOC-OR-META])
    deftable: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "deftable",
          seq(
            field("name", $._def_name),
            ":",
            "{",
            field("schema", alias($.atom, $.table_schema)),
            "}"
          ),
          optional($._doc_or_meta),
          PARENS_RIGHT
        )
      ),
    let_variable: ($) =>
      seq(
        field("name", alias($.atom, $.let_variable_identifier)),
        field("type", optional($.type_annotation))
      ),
    let_bind_pair: ($) =>
      seq(PARENS_LEFT, $.let_variable, field("value", $._from), PARENS_RIGHT),

    // (let (BINDPAIR [BINDPAIR [...]]) BODY)
    // (let* (BINDPAIR [BINDPAIR [...]]) BODY)
    let_binding: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          choice("let", "let*"),
          field(
            "bind_pairs",
            seq(PARENS_LEFT, repeat($.let_bind_pair), PARENS_RIGHT)
          ),
          field("body", repeat($._from)),
          PARENS_RIGHT
        )
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
              PARENS_RIGHT
            )
          ),
          field("else_branch", $._from),
          PARENS_RIGHT
        )
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
          PARENS_RIGHT
        )
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
          PARENS_RIGHT
        )
      ),
    // (use MODULE)
    // (use MODULE HASH)
    // (use MODULE IMPORTS)
    // (use MODULE HASH IMPORTS)
    use: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens(
          seq(
            "use",
            field("module", $.reference),
            optional(
              choice(
                seq(field("hash", $.string), field("imports", $.list)),
                field("imports", $.list)
              )
            )
          )
        )
      ),
    // (interface NAME [DOR-OR-META] BODY...)
    interface: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "interface",
          field("name", $._def_name),
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
                $.use
              )
            )
          ),
          PARENS_RIGHT
        )
      ),
    // (module NAME KEYSET-OR-GOVERNANCE [DOC-OR-META] BODY...)
    module: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(
          PARENS_LEFT,
          "module",
          field("name", alias($.atom, $.module_identifier)),
          field(
            "governance",
            alias(choice($.atom, $.string, $.symbol), $.module_governance)
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
                $.deftable
              )
            )
          ),
          PARENS_RIGHT
        )
      ),
    // (implements INTERFACE)
    implements: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        seq(PARENS_LEFT, "implements", field("interface", $.atom), PARENS_RIGHT)
      ),
  },
});

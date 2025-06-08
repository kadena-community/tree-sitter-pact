/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PARENS_LEFT = '(';
const PARENS_RIGHT = ')';
const IDENT = token(/[a-zA-Z%#+\-_&$@<>=^?*!|/~][a-zA-Z0-9%#+\-_&$@<>=^?*!|/~]*/);

const WHITESPACE = /[\s\p{Zs}\uFEFF\u2028\u2029\u2060\u200B]/u;
// comments start with a semicolon and end with a newline

const COMMENT = token(seq(';', /.*/));
const INTEGER = token(seq(optional('-'), /\d+/));
const DECIMAL = token(seq(optional('-'), /\d+\.\d+/));
const BOOLEAN = token(choice('false', 'true'));
const STRING = token(
  seq(
    '"', // Beginning double quote
    repeat(
      choice(
        /[^"\\]+/, // Match any character except double quote or backslash
        /\\./, // Match escaped characters (e.g., \n, \", \\)
        /\\\r?\n/, // Match an escaped newline.
      ),
    ),
    '"', // Ending double quote
  ),
);

const SYMBOL = token(/'[a-zA-Z][a-zA-Z0-9\-_]*/);

const PREC = {
  DOC: 20,
  SPECIAL_FORM: 10,
  LITERAL: 15,
  TYPE_IDENTIFIER: 20,
  REFERENCE: 25,
  DEREFERENCE: 26,
  PARAMETERIZED: 30,
};

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 * @returns {ChoiceRule}
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 * @returns {ChoiceRule}
 */
function listOf(rule) {
  return choice(seq('[', repeat(rule), ']'), seq('[', commaSep(rule), ']'));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {(Rule | string)|(Rule | string)[]} rules
 */
function withParens(rules) {
  const r = Array.isArray(rules) ? rules : [rules];
  return seq(PARENS_LEFT, ...r, PARENS_RIGHT);
}

module.exports = grammar({
  name: 'pact',
  extras: ($) => [$.comment, WHITESPACE],
  conflicts: ($) => [[$.list]],
  supertypes: ($) => [$._expression],
  word: ($) => $.ident,
  rules: {
    source_file: ($) => repeat(choice($._top_level, $._expression)),
    comment: () => COMMENT,

    // top level forms
    _top_level: ($) => choice($.pact_version, $.namespace, $.use, $.module, $.interface, $.defconst, $.defun),

    // literals
    integer: () => INTEGER,
    decimal: () => DECIMAL,
    string: () => STRING,
    boolean: () => BOOLEAN,
    symbol: () => SYMBOL,
    list: ($) => listOf($._expression),
    object: ($) => seq('{', commaSep($.pair), '}'),
    bindings: ($) => seq('{', commaSep($.bind_pair), '}'),
    _literal: ($) =>
      prec(
        PREC.LITERAL,
        choice($.boolean, $.integer, $.decimal, $.string, $.list, $.object, $.symbol, $.ident, $.reference),
      ),
    _expression: ($) =>
      choice(
        $._literal,
        $.let_binding,
        $.if_expression,
        $.try_expression,
        $.cond,
        $.emit_event,
        $.with_capability,
        $.with_read,
        $.with_default_read,
        $.bind,
        $.resume,
        $.lambda_expression,
        $.s_expression,
      ),
    // S-Expressions
    s_expression: ($) =>
      withParens([
        field('head', alias(choice($.reference, $.dereference), $.s_expression_head)),
        optional(field('tail', repeat($._expression))),
      ]),

    ident: () => IDENT,
    reference: ($) => prec(PREC.REFERENCE, seq($.ident, repeat(seq('.', $.ident)))),
    dereference: ($) => prec(PREC.DEREFERENCE, seq($.ident, repeat(seq('::', $.ident)))),
    _type_parameter: ($) => alias(choice($.reference, $.dereference), $.type_parameter),
    // _delimiter: ($) => choice(".", ",", ":", "::"),
    // object{type_parameter}, table{type_parameter}, module{type_parameter,anther_type_parameter,...}
    _parametrized_type: ($) =>
      prec(
        PREC.PARAMETERIZED,
        seq(
          optional(choice('object', 'table', 'module')),
          '{',
          field('type_parameter', commaSep1($._type_parameter)),
          '}',
        ),
      ),
    // [object{type_parameter}]
    _parametrized_type_list: ($) =>
      prec(PREC.PARAMETERIZED, seq('[', field('type_parameter', alias($.type_identifier, $.type_parameter)), ']')),
    type_identifier: ($) =>
      prec.left(
        PREC.TYPE_IDENTIFIER,
        choice(
          'integer',
          'decimal',
          'time',
          'bool',
          'string',
          'list',
          'value',
          'keyset',
          'guard',
          $._parametrized_type,
          $._parametrized_type_list,
          'object',
          'table',
          'module',
        ),
      ),
    type_annotation: ($) => seq(':', $.type_identifier),
    parameter_list: ($) => withParens(optional(repeat($.parameter))),
    parameter: ($) =>
      seq(field('name', alias($.ident, $.parameter_identifier)), field('type', optional($.type_annotation))),
    schema_field_list: ($) => repeat1($.schema_field),
    schema_field: ($) =>
      seq(field('name', alias($.ident, $.schema_field_identifier)), field('type', optional($.type_annotation))),
    pair: ($) => seq(field('key', $._property_name), ':', field('value', $._expression)),
    //  key := name:type
    bind_pair: ($) =>
      seq(
        field('key', alias(choice($.string, $.symbol), $.bind_pair_key)),
        ':=',
        field('name', alias($.ident, $.bind_pair_identifier)),
        field('type', optional($.type_annotation)),
      ),

    _property_name: ($) => alias(choice($.string, $.symbol), $.property_identifier),
    _def_name: ($) => alias($.ident, $.def_identifier),
    _doc_or_meta: ($) =>
      prec.right(
        PREC.DOC,
        repeat1(
          choice(
            field('doc', $.doc),
            field('model', $.model),
            field('managed', $.managed),
            field('event', $.event),
            field('meta', $.meta),
          ),
        ),
      ),

    // special forms
    pact_version: ($) => prec(PREC.SPECIAL_FORM, withParens(['pact-version', field('version', $.string)])),
    // <string> or @doc <string>
    doc: ($) => prec.right(PREC.DOC, choice(seq('@doc', alias($.string, $.doc_string)), alias($.string, $.doc_string))),
    model: ($) => seq('@model', '[', field('body', repeat(choice($.defproperty, $.s_expression))), ']'),
    defproperty: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'defproperty',
          field('name', $._def_name),
          optional(field('parameters', $.parameter_list)),
          field('body', repeat($._expression)),
        ]),
      ),
    managed: ($) =>
      prec.left(1, seq('@managed', field('args', optional($._literal)), field('manager', optional($.ident)))),
    event: ($) => prec.left(1, seq('@event', optional($.boolean))),
    // @model  <sexpr>
    // model: ($) => seq('@model', $._expression),
    // any other meta starts with @
    meta: ($) => prec.left(1, seq('@', $.ident)),
    namespace: ($) => prec(PREC.SPECIAL_FORM, withParens(['namespace', field('namespace', $._expression)])),

    // (bless HASH)
    bless: ($) => prec(PREC.SPECIAL_FORM, withParens(['bless', field('hash', $.string)])),

    // (defun NAME ARGLIST [DOC-OR-META] BODY...)
    defun: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'defun',
          seq(field('name', $._def_name), field('return_type', optional($.type_annotation))),
          field('parameters', $.parameter_list),
          optional($._doc_or_meta),
          field('body', repeat($._expression)),
        ]),
      ),
    // (defcap NAME ARGLIST [DOC] BODY...)
    defcap: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'defcap',
          seq(field('name', $._def_name), field('return_type', optional($.type_annotation))),
          field('parameters', $.parameter_list),
          optional($._doc_or_meta),
          field('body', repeat($._expression)),
        ]),
      ),
    // (defconst NAME VALUE [DOC-OR-META])
    defconst: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'defconst',
          seq(field('name', $._def_name), field('return_type', optional($.type_annotation))),
          field('body', $._expression),
          optional($._doc_or_meta),
        ]),
      ),
    // (defpact NAME ARGLIST [DOC-OR-META] STEPS...)
    defpact: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'defpact',
          seq(field('name', $._def_name), field('return_type', optional($.type_annotation))),
          field('parameters', $.parameter_list),
          optional($._doc_or_meta),
          field('body', repeat(choice($.step, $.step_with_rollback))),
        ]),
      ),
    // (defschema NAME [DOC-OR-META] FIELDS...)
    defschema: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'defschema',
          field('name', $._def_name),
          optional($._doc_or_meta),
          field('fields', $.schema_field_list),
        ]),
      ),
    // (deftable NAME[:SCHEMA] [DOC-OR-META])
    deftable: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'deftable',
          choice(
            seq(field('name', $._def_name), ':', '{', field('schema', alias($.ident, $.table_schema)), '}'),
            field('name', $._def_name),
          ),
          optional($._doc_or_meta),
        ]),
      ),
    let_variable: ($) =>
      seq(field('name', alias($.ident, $.let_variable_identifier)), field('type', optional($.type_annotation))),
    let_bind_pair: ($) => withParens([$.let_variable, field('value', $._expression)]),

    // (let (BINDPAIR [BINDPAIR [...]]) BODY)
    // (let* (BINDPAIR [BINDPAIR [...]]) BODY)
    let_binding: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          choice('let', 'let*'),
          field('bind_pairs', withParens(repeat($.let_bind_pair))),
          field('body', repeat($._expression)),
        ]),
      ),
    // (cond (TEST BRANCH) [(TEST2 BRANCH2) [...]] ELSE-BRANCH)
    cond: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'cond',
          repeat(withParens([field('test', $._expression), field('branch', $._expression)])),
          field('else_branch', $._expression),
        ]),
      ),
    // (if CONDITION THEN ELSE)
    if_expression: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'if',
          field('condition', $._expression),
          field('then', $._expression),
          field('else', $._expression),
        ]),
      ),

    // (try DEFAULT PROTECTED)
    try_expression: ($) =>
      prec(PREC.SPECIAL_FORM, withParens(['try', field('default', $._expression), field('protected', $._expression)])),

    // (step EXPR)
    // (step ENTITY EXPR)
    step: ($) =>
      prec(PREC.SPECIAL_FORM, withParens(['step', field('entity', optional($.ident)), field('expr', $._expression)])),
    // (step-with-rollback EXPR ROLLBACK-EXPR)
    // (step-with-rollback ENTITY EXPR ROLLBACK-EXPR)
    step_with_rollback: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'step-with-rollback',
          field('entity', optional($.ident)),
          field('expr', $._expression),
          field('rollback_expr', $._expression),
        ]),
      ),
    // (use MODULE)
    // (use MODULE HASH)
    // (use MODULE IMPORTS)
    // (use MODULE HASH IMPORTS)
    use: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'use',
          field('module', $.reference),
          optional(field('hash', $.string)),
          optional(field('imports', $.list)),
        ]),
      ),
    // (interface NAME [DOR-OR-META] BODY...)
    interface: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'interface',
          field('name', $._def_name),
          optional($._doc_or_meta),
          field('body', repeat(choice($.defun, $.defconst, $.defschema, $.defpact, $.defcap, $.use))),
        ]),
      ),
    // (module NAME KEYSET-OR-GOVERNANCE [DOC-OR-META] BODY...)
    module: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'module',
          field('name', alias($.ident, $.module_identifier)),
          field('governance', alias(choice($.ident, $.string, $.symbol), $.module_governance)),
          optional($._doc_or_meta),
          field(
            'body',
            repeat(
              choice($.bless, $.use, $.implements, $.defun, $.defconst, $.defschema, $.defpact, $.defcap, $.deftable),
            ),
          ),
        ]),
      ),
    // (implements INTERFACE)
    implements: ($) => prec(PREC.SPECIAL_FORM, withParens(['implements', field('interface', $.reference)])),
    // (with-capability CAPABILITY [ANY...])
    with_capability: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'with-capability',
          field('capability', $.s_expression),
          optional(field('body', repeat($._expression))),
        ]),
      ),

    // (with-read TABLE KEY BINDINGS BODY...)
    // eg (with-read accounts id { "balance":= bal, "currency":= ccy } (format "Balance for {} is {} {}" [id bal ccy]))
    with_read: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'with-read',
          field('table', $.reference),
          field('key', $._expression),
          field('bindings', $.bindings),
          field('body', repeat($._expression)),
        ]),
      ),

    // (with-default-read TABLE KEY DEFAULT BINDINGS BODY...)
    // eg (with-default-read accounts id { "balance": 0, "currency": "USD" } { "balance":= bal, "currency":= currency } (format "Balance for {} is {} {}" [id bal currency]))
    with_default_read: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'with-default-read',
          field('table', $.reference),
          field('key', $._expression),
          field('default', $.object),
          field('bindings', $.bindings),
          field('body', repeat($._expression)),
        ]),
      ),

    // (bind SRC BINDINGS BODY...)
    bind: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens([
          'bind',
          field('src', $._expression),
          field('bindings', $.bindings),
          field('body', repeat($._expression)),
        ]),
      ),

    // (resume BINDINGS BODY...)
    resume: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens(['resume', field('bindings', $.bindings), field('body', repeat($._expression))]),
      ),

    // (emit-event CAPABILITY)
    // eg (emit-event (TRANSFER "" account balance))
    emit_event: ($) => prec(PREC.SPECIAL_FORM, withParens(['emit-event', field('capability', $._expression)])),

    // (lambda ARGLIST BODY...)
    lambda_expression: ($) =>
      prec(
        PREC.SPECIAL_FORM,
        withParens(['lambda', field('parameters', $.parameter_list), field('body', repeat($._expression))]),
      ),
  },
});

; Builtins
((atom) @constant.builtin
    (#any-of? @constant.builtin
        "CHARSET_ASCII"
        "CHARSET_LATIN1"
    )
)


; Special forms
(s_expression
  head: (s_expression_head) @function.builtin
  (#any-of? @function.builtin
    "abs" "add-time" "and" "and?" "at" "base64-decode" "base64-encode" "bind" "ceiling" "chain-data" "compose" "compose-capability" "concat" "constantly" "contains" "continue" "create-capability-guard" "create-capability-pact-guard" "create-module-guard" "create-pact-guard" "create-principal" "create-table" "create-user-guard" "days" "dec" "decrypt-cc20p1305" "define-keyset" "define-namespace" "describe-keyset" "describe-module" "describe-namespace" "describe-table" "diff-time" "distinct" "drop" "emit-event" "enforce" "enforce-guard" "enforce-keyset" "enforce-one" "enforce-pact-version" "enumerate" "exp" "filter" "floor" "fold" "fold-db" "format" "format-time" "hash" "hours" "identity" "if" "insert" "install-capability" "int-to-str" "is-charset" "is-principal" "keylog" "keys" "keys-2" "keys-all" "keys-any" "keyset-ref-guard" "length" "list" "list-modules" "ln" "log" "make-list" "map" "minutes" "mod" "namespace" "not" "not?" "or" "or?" "pact-id" "pact-version" "pairing-check" "parse-time" "point-add" "poseidon-hash-hack-a-chain" "public-chain-data" "read" "read-decimal" "read-integer" "read-keyset" "read-msg" "read-string" "remove" "require-capability" "resume" "reverse" "round" "scalar-mult" "select" "shift" "sort" "sqrt" "str-to-int" "str-to-list" "take" "time" "try" "tx-hash" "txids" "txlog" "typeof" "typeof-principal" "update" "validate-keypair" "validate-principal" "verify-spv" "where" "with-capability" "with-default-read" "with-read" "write" "xor" "yield" "zip"
  )
)

(s_expression
  head: (s_expression_head) @operator
  (#match? @operator "^([^+*-+=<>|~]|<=|>=|!=)$")
)

[
  "defpact"
  "defun"
  "defcap"
  "defschema"
  "cond"
  "defconst"
  "module"
  "deftable"
  "use"
  "bless"
  "interface"
  "implements"
  "step-with-rollback"
  "step"
  "let"
  "let*"
] @keyword


[
  (model)
  (managed)
  (doc)
  (meta)
]  @annotation

;[
 ;"."
 ;","
 ;":"
 ;"::"
;] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
]  @punctuation.bracket


; Function and method calls

(s_expression head: (s_expression_head) @function)

; Variables

([
    (atom)
 ] @constant
 (#match? @constant "^[A-Z_][A-Z\\d_]+$"))
;(atom) @variable

; Properties

; (object
;     (key_value_pair key: [


;     ] @property
;     )
; )

; Literals

; [
;   "true"
;   "false"
; ] @constant.builtin

(comment) @comment
(type_identifier) @type
(integer) @number
(string) @string
(boolean) @boolean
(object) @object
(list) @array
(symbol) @string
(decimal) @number.float
(property_identifier) @property

(use module: (reference) @module)
(defpact name: (def_identifier) @function)
(defun name: (def_identifier) @function)
(defcap name: (def_identifier) @function)
(defconst name: (def_identifier) @constant)
(defschema name: (def_identifier) @type)
(deftable name: (def_identifier) @type)

(parameter_identifier) @variable.parameter
(let_binding (let_bind_pair (let_variable (let_variable_identifier) @variable)))

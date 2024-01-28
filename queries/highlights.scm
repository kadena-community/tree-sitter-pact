; Builtins
((atom) @constant.builtin
    (#any-of? @constant.builtin
        "CHARSET_ASCII"
        "CHARSET_LATIN1"
    )
)


; Special forms
(s_expression
  head: (atom) @function.builtin
  (#any-of? @function.builtin
    "abs" "add-time" "and" "and?" "at" "base64-decode" "base64-encode" "bind" "ceiling" "chain-data" "compose" "compose-capability" "concat" "constantly" "contains" "continue" "create-capability-guard" "create-capability-pact-guard" "create-module-guard" "create-pact-guard" "create-principal" "create-table" "create-user-guard" "days" "dec" "decrypt-cc20p1305" "define-keyset" "define-namespace" "describe-keyset" "describe-module" "describe-namespace" "describe-table" "diff-time" "distinct" "drop" "emit-event" "enforce" "enforce-guard" "enforce-keyset" "enforce-one" "enforce-pact-version" "enumerate" "exp" "filter" "floor" "fold" "fold-db" "format" "format-time" "hash" "hours" "identity" "if" "insert" "install-capability" "int-to-str" "is-charset" "is-principal" "keylog" "keys" "keys-2" "keys-all" "keys-any" "keyset-ref-guard" "length" "list" "list-modules" "ln" "log" "make-list" "map" "minutes" "mod" "namespace" "not" "not?" "or" "or?" "pact-id" "pact-version" "pairing-check" "parse-time" "point-add" "poseidon-hash-hack-a-chain" "public-chain-data" "read" "read-decimal" "read-integer" "read-keyset" "read-msg" "read-string" "remove" "require-capability" "resume" "reverse" "round" "scalar-mult" "select" "shift" "sort" "sqrt" "str-to-int" "str-to-list" "take" "time" "try" "tx-hash" "txids" "txlog" "typeof" "typeof-principal" "update" "validate-keypair" "validate-principal" "verify-spv" "where" "with-capability" "with-default-read" "with-read" "write" "xor" "yield" "zip"
  )
)

(s_expression
  head: (atom) @operator
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


; [
;   "."
;   ","
;   ":"
;   "::"
; ] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
]  @punctuation.bracket


; Function and method calls

; (s_expression head: (atom) @function)

; Variables

;(atom) @variable

; Properties

; (object_literal
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
(integer_literal) @number
(string_literal) @string
(boolean_literal) @boolean
; (object_literal) @object
(list_literal) @array
(symbol_literal) @string.special.symbol
(decimal_literal) @number.float

(use module: (atom) @module)
(defpact name: (atom) @function)
(defun name: (atom) @function)
(defcap name: (atom) @function)
(defconst name: (atom) @constant)
(defschema name: (atom) @type)
(deftable name: (atom) @type)

(defun (arg_list (arg) @variable.parameter))

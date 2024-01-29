; Builtins
((atom) @constant.macro
    (#any-of? @constant.macro
        "CHARSET_ASCII"
        "CHARSET_LATIN1"
    )
)


; Special forms
(s_expression
  head: (s_expression_head) @function.builtin
  (#any-of? @function.builtin
    "abs" "add-time"  "at" "base64-decode" "base64-encode" "bind" "ceiling" "chain-data" "compose" "compose-capability" "concat" "constantly" "contains" "continue" "create-capability-guard" "create-capability-pact-guard" "create-module-guard" "create-pact-guard" "create-principal" "create-table" "create-user-guard" "days" "dec" "decrypt-cc20p1305" "define-keyset" "define-namespace" "describe-keyset" "describe-module" "describe-namespace" "describe-table" "diff-time" "distinct" "drop" "emit-event" "enumerate" "exp" "filter" "floor" "fold" "fold-db" "format" "format-time" "hash" "hours" "identity" "insert" "install-capability" "int-to-str" "is-charset" "is-principal" "keylog" "keys" "keys-2" "keys-all" "keys-any" "keyset-ref-guard" "length" "list" "list-modules" "ln" "log" "make-list" "map" "minutes" "mod" "namespace" "pact-id" "pact-version" "pairing-check" "parse-time" "point-add" "poseidon-hash-hack-a-chain" "public-chain-data" "read" "read-decimal" "read-integer" "read-keyset" "read-msg" "read-string" "remove" "require-capability" "reverse" "round" "scalar-mult" "select" "shift" "sort" "sqrt" "str-to-int" "str-to-list" "take" "time" "try" "tx-hash" "txids" "txlog" "typeof" "typeof-principal" "update" "validate-keypair" "validate-principal" "verify-spv" "where" "with-capability" "with-default-read" "with-read" "write" "zip"
  )
)

(s_expression
  head: (s_expression_head) @keyword.exception
  (#any-of? @keyword.exception
    "enforce" "enforce-guard" "enforce-keyset" "enforce-one" "enforce-pact-version"
  )
)

(s_expression
  head: (s_expression_head) @keyword.operator 
  (#any-of? @keyword.operator 
    "and" "and?" "not" "not?" "or" "or?" "xor"
  )
)

(s_expression
  head: (s_expression_head) @keyword.conditional
  (#any-of? @keyword.operator 
    "if"
  )
)
"cond" @keyword.conditional


(s_expression
  head: (s_expression_head) @keyword.return
  (#any-of?  @keyword.return
    "yield" "resume"
  )
)

(s_expression
  head: (s_expression_head) @operator
  (#any-of? @operator "^" "+" "*" "-" "+" "=" "<" ">" "|" "~" "<=" ">=" "!=")
)

[
  "defschema"
  "cond"
  "defconst"
  "module"
  "bless"
  "interface"
  "implements"
] @keyword

"use" @keyword.import
"deftable" @keyword.storage

[
  "step"
  "step-with-rollback"
] @keyword.return

"defpact" @keyword.coroutine      

[
  "defun"
  "defcap"
] @keyword.function 

[
  "let"
  "let*"
] @keyword.storage

"namespace" @keyword.directive 

[
  (model)
  (managed)
  (doc)
  (event)
  (meta)
]  @attribute 

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


; [
;   "true"
;   "false"
; ] @constant.builtin

(comment) @comment
(type_identifier) @type.builtin
(integer) @number
(decimal) @number.float
(string) @string
(boolean) @boolean
(object) @object
(list) @array
(symbol) @string.special.symbol
(property_identifier) @property
(doc_string) @string.documentation
(type_identifier (reference)) @type

(use module: (reference) @module)
(defpact name: (def_identifier) @function.method )
(defun name: (def_identifier) @function.method )
(defcap name: (def_identifier) @function.method )
(defconst name: (def_identifier) @constant)
(defschema name: (def_identifier) @type.definition)

(parameter_identifier) @variable.parameter
(let_binding (let_bind_pair (let_variable (let_variable_identifier) @variable)))
(reference) @variable.member

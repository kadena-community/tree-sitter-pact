; Scopes
;-------

(let_binding) @local.scope

(defun
  name: (atom) @local.definition.function
  (#set! definition.function.scope "parent"))
(defpact
  name: (atom) @local.definition.function
  (#set! definition.pact.scope "parent"))
(defcap
    name: (atom) @local.definition.function
    (#set! definition.cap.scope "parent"))

(use imports: (atom) @local.definition.import)

; Definitions
;------------

(arg_list (arg name: (atom) @local.definition.parameter))
(arg_list (arg type: (type_identifier) @local.definition.type))

(let_binding (let_bind_pair key: (atom) @local.definition.parameter))

; References
;------------
;(s_expression head: (atom) @local.reference)

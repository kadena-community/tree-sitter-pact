; Scopes
;-------

(let_binding) @local.scope

(module
  name:  (module_identifier) @local.scope
  (#set! scope.type "module"))

(defun
  name: (def_identifier) @local.definition.function
  (#set! definition.function.scope "parent"))
(defpact
  name: (def_identifier) @local.definition.function
  (#set! definition.function.scope "parent"))
(defcap
  name: (def_identifier) @local.definition.function
  (#set! definition.function.scope "parent"))

(use imports: (list (reference) @local.definition.import))

; Definitions
;------------

(parameter_list (parameter name: (parameter_identifier) @local.definition.parameter))
(parameter_list (parameter (type_annotation (type_identifier) @local.definition.type)))

(let_binding (let_bind_pair (let_variable (let_variable_identifier) @local.definition.parameter)))

; References
;------------
;(s_expression (s_expression_head) @local.reference)

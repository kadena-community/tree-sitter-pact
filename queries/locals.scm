; Scopes
;-------


(let_binding body:(_) @local.scope)
(defun body: (_) @local.scope)
(defpact steps: (_) @local.scope)
(defcap body: (_) @local.scope)
(module body: (_) @local.scope)
(defconst body: (_) @local.scope)


(module
  name:  (module_identifier) @local.definition.namespace 
  (#set! definition.namespace.scope "global"))


(defun name: (def_identifier) @local.definition.function
  (#set! definition.function.scope "parent"))

(defpact
  name: (def_identifier) @local.definition.function
  (#set! definition.function.scope "parent"))

(defcap
  name: (def_identifier) @local.definition.function
  (#set! definition.function.scope "parent"))

(defconst
  name: (def_identifier) @local.definition.constant
  (#set! definition.constant.scope "parent"))


(use imports: (list (reference) @local.definition.import))

(object (pair (property_identifier) @local.definition.field))
(parameter_list (parameter (parameter_identifier) @local.definition.parameter))
(parameter_list (parameter (type_annotation (type_identifier) @local.definition.associated)))
(let_binding (let_bind_pair (let_variable (let_variable_identifier) @local.definition.var)))

; References
;------------
(atom) @local.reference
(reference) @local.reference

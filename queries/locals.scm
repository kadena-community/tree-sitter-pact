; Scopes
;-------

(defun) @local.scope
(defcap) @local.scope
(defpact) @local.scope
(defconst) @local.scope
(module) @local.scope
(let_binding) @local.scope
(defschema) @local.scope
(defproperty) @local.scope

(use imports: (list (reference) @local.definition))

(property_identifier) @local.definition.field
(parameter_identifier) @local.definition
(type_annotation (type_identifier) @local.definition.associated)
(let_variable_identifier) @local.definition

; References
;------------
(reference (atom) @local.reference)

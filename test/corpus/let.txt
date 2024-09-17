==================
let binding
==================
(module coin GOVERNANCE
  (defun TRANSFER-mgr:decimal
    ( managed:decimal
      requested:decimal
    )

    (let ((newbal (- managed requested)))
      (enforce (>= newbal 0.0)
        (format "TRANSFER exceeded for balance {}" [managed]))
      newbal)
  )
)
---
(source_file
  (module
    (module_identifier)
    (module_governance)
    (defun
      (def_identifier)
      (type_identifier)
      (parameter_list
        (parameter
          (parameter_identifier)
          (type_annotation
            (type_identifier)))
        (parameter
          (parameter_identifier)
          (type_annotation
            (type_identifier))))
      (let_binding
        (let_bind_pair
          (let_variable
            (let_variable_identifier))
          (s_expression
            (s_expression_head
              (atom))
            (reference
              (atom))
            (reference
              (atom))))
        (s_expression
          (s_expression_head
            (atom))
          (s_expression
            (s_expression_head
              (atom))
            (reference
              (atom))
            (decimal))
          (s_expression
            (s_expression_head
              (atom))
            (string)
            (list
              (reference
                (atom)))))
        (reference
          (atom))))))

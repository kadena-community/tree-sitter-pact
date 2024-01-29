==================
defcap
==================
(module coin GOVERNANCE
   (defcap CREDIT (receiver:string)
    "Capability for managing crediting operations"
    (enforce (!= receiver "") "valid receiver"))

  (defcap ROTATE (account:string)
    @doc "Autonomously managed capability for guard rotation"
    @managed
    true)
)

---
(source_file
    (module
    (module_identifier)
    (module_governance)
    (defcap
        (def_identifier)
        (parameter_list
        (parameter
            (parameter_identifier)
            (type_annotation
                (type_identifier))))
        (string)
        (s_expression
            (s_expression_head (atom))
        (s_expression
            (s_expression_head (atom))
            (reference (atom))
            (string))
        (string)))
    (defcap
        (def_identifier)
        (parameter_list
            (parameter
                (parameter_identifier)
                (type_annotation
                    (type_identifier))))
        (doc
        (doc_string))
        (managed)
        (boolean))))

==================
complex
==================
(module coin GOVERNANCE
 (defcap TRANSFER:bool
    ( sender:string
      receiver:string
      amount:decimal
    )
    @managed amount TRANSFER-mgr
    (enforce (!= sender receiver) "same sender and receiver")
    (enforce-unit amount)
    (enforce (> amount 0.0) "Positive amount")
    (compose-capability (DEBIT sender))
    (compose-capability (CREDIT receiver))
  )
)
(source_file
    (module
    (atom)
    (atom)
    (defcap
        (atom)
        (type_identifier)
        (parameter_list
        (parameter
            (parameter_identifier)
            (type_identifier))
        (parameter
            (parameter_identifier)
            (type_identifier))
        (parameter
            (parameter_identifier)
            (type_identifier)))
        (managed
        (atom)
        (atom))
        (s_expression
        (atom)
        (s_expression
            (atom)
            (atom)
            (atom))
        (string))
        (s_expression
        (atom)
        (atom))
        (s_expression
        (atom)
        (s_expression
            (atom)
            (atom)
            (decimal))
        (string))
        (s_expression
        (atom)
        (s_expression
            (atom)
            (atom)))
        (s_expression
        (atom)
        (s_expression
            (atom)
            (atom))))))

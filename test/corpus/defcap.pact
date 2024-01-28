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
    (atom)
    (atom)
    (defcap
        (atom)
        (arg_list
        (arg
            (atom)
            (type_identifier)))
        (string_literal)
        (s_expression
        (atom)
        (s_expression
            (atom)
            (atom)
            (string_literal))
        (string_literal)))
    (defcap
        (atom)
        (arg_list
        (arg
            (atom)
            (type_identifier)))
        (doc
        (string_literal))
        (managed)
        (boolean_literal))))

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
        (arg_list
        (arg
            (atom)
            (type_identifier))
        (arg
            (atom)
            (type_identifier))
        (arg
            (atom)
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
        (string_literal))
        (s_expression
        (atom)
        (atom))
        (s_expression
        (atom)
        (s_expression
            (atom)
            (atom)
            (decimal_literal))
        (string_literal))
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

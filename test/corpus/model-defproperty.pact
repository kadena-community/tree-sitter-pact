==================
@model defproperty
==================

(module coin GOVERNANCE
    @model
    [ (defproperty conserves-mass
        (= (column-delta coin-table 'balance) 0.0))

      (defproperty valid-account (account:string)
        (and
          (>= (length account) 3)
          (<= (length account) 256)))
    ]
)

---
(source_file
    (module
    (atom)
    (atom)
    (model
        (defproperty
        (atom)
        (s_expression
            (atom)
            (s_expression
            (atom)
            (atom)
            (symbol_literal))
            (decimal_literal)))
        (defproperty
        (atom)
        (arg_list
            (arg
            (atom)
            (type_identifier)))
        (s_expression
            (atom)
            (s_expression
            (atom)
            (s_expression
                (atom)
                (atom))
            (integer_literal))
            (s_expression
            (atom)
            (s_expression
                (atom)
                (atom))
            (integer_literal)))))))

==================
Module
==================

(module test G
    (defcap G() true)
)
---
(source_file
    (module
        (atom)
        (atom)
        (defcap
            (atom)
            (arg_list)
            (boolean_literal))))

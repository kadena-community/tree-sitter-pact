(module coin GOVERNANCE
  (defcap GOVERNANCE() true)
  (defun TRANSFER-mgr:decimal ( managed:decimal requested:decimal)
    (let ((newbal (- managed requested)))
      (enforce (+ newbal 0.0) (format "TRANSFER exceeded for balance {}" ['managed 'requested]))
      newbal
    )
  )
)

(module coin GOVERNANCE
  (defun TRANSFER-mgr:decimal ( managed:decimal requested:decimal)
    (let ((newbal (- managed requested)))
      (enforce (>= newbal 0.0) (format "TRANSFER exceeded for balance {}" [managed]))
      newbal
    )
  )
)

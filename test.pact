(module test G
  (defcap G () true)

  (defun my-fun-1 (a: integer)
    1)

  (defun my-fun-2:string (a: integer)
    (my-fun-1 a))
  )

;used for retrieve the toplevel definition
(test.my-fun-1 1)

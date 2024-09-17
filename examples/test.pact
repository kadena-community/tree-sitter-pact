(module todos G
  (defcap G () true)
  (defschema todo
    @doc "A todo item"
    id:integer
    title:string
    completed:bool
  )
  (deftable todo-table:{todo})

  (defun read-todo ()
    "Read a todo."
    (format "Todo: {}" (keys todo-table))
  )
  (defun read-todos ()
    "Read all todos."
    (map (read-todo) (keys todo-table))
  )
)


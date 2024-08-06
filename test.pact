(module todos G
  (defun read-todos:[[object{todo}]] ()
    "Read all todos."
    (map (read-todo) (keys todo-table))
  )
)



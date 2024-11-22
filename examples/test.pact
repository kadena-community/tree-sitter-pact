(namespace "free")
(module todos G

  (defcap G() true)

  ;; todo schema and table
  (defschema todo
    "Row type for todos table"
    id:string
    title:string
    completed:bool
    deleted:bool
  )

  (deftable todo-table:{todo})

  ;;
  ;; API functions
  ;;
  (defun new-todo:string (id:string title:string)
    @doc "Create new todo with ENTRY and DATE."
    (insert todo-table id { "id": id,"title": title,"completed": false,"deleted": false})
  )

  (defun toggle-todo-status (id:string)
    "Toggle completed status flag for todo at ID."
    (with-read todo-table id { "completed":= state } (update todo-table id { "completed": (not state) })))

  (defun edit-todo (id:string title:string)
    "Update todo ENTRY at ID."
    (update todo-table id { "title": title }))

  (defun delete-todo (id:string)
    "Delete todo title at ID (by setting deleted flag)."
    (update todo-table id { "deleted": true }))

  (defun read-todo:object{todo} (id:string)
    "Read a single todo"
    (read todo-table id))

  (defun read-todos:[object{todo}] ()
    "Read all todos."
    (map (read-todo) (keys todo-table)))
)


(if (read-msg "upgrade") ["Module upgraded"] [(create-table todo-table)])

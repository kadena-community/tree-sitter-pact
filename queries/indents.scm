[
  (list "[")
  (object "{")
  (module body: (_))
  (parameter_list)
  (use imports: (list))
  (defun body: (_))
  (defcap body: (_))
  (defconst body: (_))
  (defschema body: (_))
  (defpact body: (_))
  (let_binding body: (_))
  (let_binding bind_pairs: (_))
  (defproperty body: (_))
  (model "[")
  (s_expression tail: (_))
] @indent.begin


(object "}" @indent.end)
(list "]" @indent.end)
(module ")" @indent.end)
(defun ")" @indent.end)
(defcap ")" @indent.end)
(defconst ")" @indent.end)
(defschema ")" @indent.end)
(defpact ")" @indent.end)
(let_binding ")" @indent.end)
(defproperty ")" @indent.end)
(model "]" @indent.end)
(s_expression ")" @indent.end)


(string) @indent.ignore
(doc_string) @indent.ignore

[
  (comment)
  (ERROR)
] @indent.auto
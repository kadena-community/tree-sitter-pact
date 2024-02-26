(module 
  name: (module_identifier) @name
  body: (defun name:(def_identifier) @name 
               parameters: (parameter_list (parameter)) @params 
               return_type: (type_identifier)? @return_type
        ) @function
)

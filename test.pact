(module coin G
  (defcap G() true)
  (defun test:string(name:string)
    (coin.transfer coin.sss "Hello, {}" name coin.ssss)
    {
      "test": "Hello"
    }
    name
  )
)


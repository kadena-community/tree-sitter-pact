==================
Multi-line string
==================

(module coin GOVERNANCE
  @doc "'coin' represents the Kadena Coin Contract. This contract provides both the \
  \buy/redeem gas support in the form of 'fund-tx', as well as transfer,       \
  \credit, debit, coinbase, account creation and query, as well as SPV burn    \
  \create. To access the coin contract, you may use its fully-qualified name,  \
  \or issue the '(use coin)' command in the body of a module declaration."
)

---
(source_file
  (module
    name: (module_identifier)
    governance: (module_governance)
    doc: (doc (string))))

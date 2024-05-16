package tree_sitter_pact_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-pact"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_pact.Language())
	if language == nil {
		t.Errorf("Error loading Pact grammar")
	}
}

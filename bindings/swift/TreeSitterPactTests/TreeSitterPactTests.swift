import SwiftTreeSitter
import TreeSitterPact
import XCTest

final class TreeSitterPactTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_pact())
        XCTAssertNoThrow(
            try parser.setLanguage(language),
            "Error loading Pact grammar")
    }
}

// swift-tools-version: 6.0
import PackageDescription

let settings: [SwiftSetting] = [
    .enableExperimentalFeature("StrictConcurrency")
]

let package = Package(
    name: "TreeSitterPact",
    products: [
        .library(name: "TreeSitterPact", targets: ["TreeSitterPact"])
    ],
    dependencies: [
        .package(url: "https://github.com/tree-sitter/swift-tree-sitter", branch: "main")
    ],
    targets: [
        .target(
            name: "TreeSitterPact",
            path: ".",
            sources: [
                "src/parser.c"
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterPactTests",
            dependencies: [
                .product(name: "SwiftTreeSitter", package: "swift-tree-sitter"),
                "TreeSitterPact",
            ],
            path: "bindings/swift/TreeSitterPactTests"
        ),
    ],
    cLanguageStandard: .c11
)

function normalizeFilename(filename) {
  return filename.replaceAll("\\", "/");
}

function isGeneratedRouteTree(filename) {
  return filename.endsWith("/src/routeTree.gen.ts") || filename === "src/routeTree.gen.ts";
}

function isTypesFile(filename) {
  return filename.includes("/src/types/") || filename.startsWith("src/types/");
}

function isTypeReexport(node) {
  if (!node.source) return false;
  if (node.exportKind === "type") return true;
  return node.specifiers?.some((specifier) => specifier.exportKind === "type") ?? false;
}

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Keep type declarations in src/types, one declaration per file, and forbid type re-exports",
    },
    schema: [],
    messages: {
      declarationOutsideTypes:
        "Move this {{kind}} declaration to its own file under src/types/**.",
      multipleDeclarations:
        "Keep exactly one type/interface declaration per file under src/types/**.",
      typeReexport:
        "Do not re-export types. Import the type directly from its canonical src/types/** file.",
    },
  },

  create(context) {
    const filename = normalizeFilename(context.filename);

    if (isGeneratedRouteTree(filename)) {
      return {};
    }

    const typesFile = isTypesFile(filename);
    let declarationCount = 0;

    function checkDeclaration(node) {
      if (!typesFile) {
        context.report({
          node,
          messageId: "declarationOutsideTypes",
          data: { kind: node.type === "TSInterfaceDeclaration" ? "interface" : "type" },
        });
        return;
      }

      declarationCount += 1;
      if (declarationCount > 1) {
        context.report({ node, messageId: "multipleDeclarations" });
      }
    }

    function checkNamedExport(node) {
      if (isTypeReexport(node)) {
        context.report({ node, messageId: "typeReexport" });
      }
    }

    function checkExportAll(node) {
      if (node.exportKind === "type") {
        context.report({ node, messageId: "typeReexport" });
      }
    }

    return {
      TSTypeAliasDeclaration: checkDeclaration,
      TSInterfaceDeclaration: checkDeclaration,
      ExportNamedDeclaration: checkNamedExport,
      ExportAllDeclaration: checkExportAll,
    };
  },
};

import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";

import typeBoundaries from "./type-boundaries.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("type-boundaries", typeBoundaries, {
  valid: [
    {
      filename: "/repo/src/types/application/user/user.ts",
      code: "export type User = { id: string };",
    },
    {
      filename: "/repo/src/components/user-card.tsx",
      code: "const userId = '1';",
    },
    {
      filename: "/repo/src/routeTree.gen.ts",
      code: "export type GeneratedRoute = string; interface GeneratedRegistry {}",
    },
  ],
  invalid: [
    {
      filename: "/repo/src/components/user-card.tsx",
      code: "type Props = { id: string };",
      errors: [{ messageId: "declarationOutsideTypes" }],
    },
    {
      filename: "/repo/src/lib/client.ts",
      code: "interface Options { retry?: boolean }",
      errors: [{ messageId: "declarationOutsideTypes" }],
    },
    {
      filename: "/repo/src/types/application/user/user.ts",
      code: "export type User = { id: string }; export type UserId = string;",
      errors: [{ messageId: "multipleDeclarations" }],
    },
    {
      filename: "/repo/src/types/application/user/index.ts",
      code: 'export type { User } from "./user";',
      errors: [{ messageId: "typeReexport" }],
    },
    {
      filename: "/repo/src/lib/api.ts",
      code: 'export { type User } from "../types/application/user/user";',
      errors: [{ messageId: "typeReexport" }],
    },
  ],
});

import { RuleTester } from "eslint";

import jsxContentSpacing from "./jsx-content-spacing.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("jsx-content-spacing", jsxContentSpacing, {
  valid: [
    `const view = (
  <>
    <Avatar />
    <Badge />
    <Icon />
  </>
);`,
    `const view = (
  <>
    <Avatar />

    <p>aaa</p>

    <span>b</span>

    <Button />
  </>
);`,
    `const view = (
  <>
    <div></div>
    <div>   </div>
  </>
);`,
    `const view = (
  <>
    <Header />
    {/* keep this comment untouched */}
    <Main />
  </>
);`,
  ],
  invalid: [
    {
      code: `const view = (
  <>
    <Avatar />

    <Badge />
  </>
);`,
      output: `const view = (
  <>
    <Avatar />
    <Badge />
  </>
);`,
      errors: [{ messageId: "removeBlankLine" }],
    },
    {
      code: `const view = (
  <>
    <Avatar />
    <p>aaa</p>
  </>
);`,
      output: `const view = (
  <>
    <Avatar />

    <p>aaa</p>
  </>
);`,
      errors: [{ messageId: "requireBlankLine" }],
    },
    {
      code: `const view = (
  <>
    <p>aaa</p>
    <Button />
  </>
);`,
      output: `const view = (
  <>
    <p>aaa</p>

    <Button />
  </>
);`,
      errors: [{ messageId: "requireBlankLine" }],
    },
    {
      code: `const view = (
  <>
    <Main>
      <Feed />
    </Main>
    <Footer />
  </>
);`,
      output: `const view = (
  <>
    <Main>
      <Feed />
    </Main>

    <Footer />
  </>
);`,
      errors: [{ messageId: "requireBlankLine" }],
    },
    {
      code: `const view = (
  <>
    <Label>{label}</Label>
    <Icon />
  </>
);`,
      output: `const view = (
  <>
    <Label>{label}</Label>

    <Icon />
  </>
);`,
      errors: [{ messageId: "requireBlankLine" }],
    },
  ],
});

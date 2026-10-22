import type { AuthFormProps } from "./auth-form-props";

export type LoginFormProps = AuthFormProps & {
  onForgot: () => void;
};

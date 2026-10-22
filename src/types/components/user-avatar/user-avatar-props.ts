export type UserAvatarProps = {
  frame?: string | null;
  src?: string | null;
  alt?: string | null;
  className?: string;
  fallback?: string;
  fallbackClassName?: string;
  /** Em campos compactos, mantém a moldura com efeito dentro do círculo do avatar. */
  frameOverflow?: "visible" | "hidden";
};

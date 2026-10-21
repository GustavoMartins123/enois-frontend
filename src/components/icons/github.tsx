import type { ComponentProps } from "react";

/**
 * A marca do GitHub, desenhada aqui.
 *
 * O lucide-react tirou os icones de marca na v1 (o `Github` nao existe mais la). Como o app so
 * usa esse icone para linkar para o repositorio do projeto — uso de logo apontando para a marca,
 * que e o caso previsto pelas regras da marca — o desenho fica aqui, em um componente proprio.
 */
export function GithubIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className} {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.27-2.53-.49-1.19-.94-1.49-1.51-.13-.22-.33-.26-.5-.01-.13-.01-.25-.01-.36.01-.24.16-.44.28-.54-1.19-.13-2.46-.6-2.46-2.65 0-.59.21-1.06.56-1.44-.06-.13-.24-.68-.26-1.32 0 0 .45-.15 1.48.54A5.1 5.1 0 018 5.1c.46 0 .96.06 1.41.17 1.03-.69 1.48-.54 1.48-.54.02.64.1 1.19.26 1.32.35.38.56.85.56 1.44 0 2.05-1.28 2.52-2.47 2.65.2.16.37.48.37.96 0 .69-.01 1.27-.01 1.44 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

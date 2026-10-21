import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    // Botões cheios (default, destructive) desativam com cor própria, e não `opacity-50`: meia
    // transparência sobre o acento deixava o "Publicar" de temas coloridos num rosa lavado de ~2:1,
    // que mal se lia e parecia só pálido. `muted` + `muted-foreground` vêm do tema, com contraste
    // conferido. Os vazados (outline, ghost, link) seguem com opacidade: sem fundo, é o que mais
    // deixa claro que estão desativados.
    variants: {
      variant: {
        // `primary-foreground` (e nao branco chumbado) porque quem decide a cor do texto do botao e o
        // tema: no tema escuro o acento e CLARO e o texto dele e escuro — branco ali ficava ilegivel
        // (~2:1). Com o token, vale para o tema padrao, o escuro e o acento que a pessoa escolher.
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
        outline:
          "border border-border-soft bg-transparent hover:bg-surface-2 hover:text-foreground disabled:opacity-50",
        secondary: "bg-surface-2 text-foreground hover:bg-surface-3 disabled:opacity-50",
        ghost: "hover:bg-surface-2 hover:text-foreground disabled:opacity-50",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 disabled:opacity-50",
      },
      size: {
        default: "h-auto w-full rounded-full px-8 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
